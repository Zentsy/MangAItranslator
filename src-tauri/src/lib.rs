use serde::Deserialize;
use sqlx::{Connection, SqliteConnection};
use std::fs;
use std::net::{SocketAddr, TcpStream};
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

#[derive(Deserialize)]
struct PersistedBlockInput {
    id: String,
    text: String,
    #[serde(rename = "type")]
    block_type: String,
}

#[derive(Deserialize)]
struct PersistedPageInput {
    id: String,
    path: String,
    name: String,
    status: String,
    blocks: Vec<PersistedBlockInput>,
}

fn database_url(app: &AppHandle) -> Result<String, String> {
    let app_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let db_path = app_dir.join("mangai.db");
    Ok(format!("sqlite:{}", db_path.to_string_lossy()))
}

fn is_supported_image(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| {
            matches!(
                ext.to_ascii_lowercase().as_str(),
                "png" | "jpg" | "jpeg" | "webp"
            )
        })
        .unwrap_or(false)
}

#[tauri::command]
fn check_ollama_status() -> Result<bool, String> {
    let address: SocketAddr = "127.0.0.1:11434"
        .parse()
        .map_err(|e: std::net::AddrParseError| e.to_string())?;

    Ok(TcpStream::connect_timeout(&address, Duration::from_millis(250)).is_ok())
}

#[tauri::command]
async fn start_ollama() -> Result<String, String> {
    if cfg!(target_os = "windows") {
        let mut command = Command::new("ollama");
        command
            .arg("serve")
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());

        #[cfg(target_os = "windows")]
        command.creation_flags(CREATE_NO_WINDOW);

        command
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    } else {
        Command::new("ollama")
            .arg("serve")
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    }
}

// Comandos para gerenciar o cache de imagens
#[tauri::command]
async fn cache_image(
    app: AppHandle,
    project_id: String,
    image_path: String,
) -> Result<String, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let cache_dir = app_dir.join("cache").join(&project_id);

    if !cache_dir.exists() {
        fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    }

    let file_name = Path::new(&image_path)
        .file_name()
        .ok_or("Caminho de arquivo inválido")?;

    let target_path = cache_dir.join(file_name);
    fs::copy(&image_path, &target_path).map_err(|e| e.to_string())?;

    // NORMALIZAÇÃO DO CAMINHO PARA O FRONTEND
    Ok(target_path.to_string_lossy().replace("\\", "/"))
}

#[tauri::command]
async fn clear_project_cache(app: AppHandle, project_id: String) -> Result<(), String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let cache_dir = app_dir.join("cache").join(&project_id);

    if cache_dir.exists() {
        fs::remove_dir_all(cache_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn list_chapter_images(source_path: String) -> Result<Vec<String>, String> {
    let source = Path::new(&source_path);
    let directory = if source.is_dir() {
        source
    } else {
        source
            .parent()
            .ok_or("Nao foi possivel localizar a pasta da pagina selecionada")?
    };

    let mut images = Vec::new();
    let entries = fs::read_dir(directory).map_err(|e| e.to_string())?;

    for entry in entries {
        let path = entry.map_err(|e| e.to_string())?.path();
        if path.is_file() && is_supported_image(&path) {
            images.push(path.to_string_lossy().replace("\\", "/"));
        }
    }

    Ok(images)
}

#[tauri::command]
async fn save_page_atomic(
    app: AppHandle,
    project_id: String,
    page: PersistedPageInput,
    order_index: i64,
) -> Result<(), String> {
    let database_url = database_url(&app)?;
    let mut connection = SqliteConnection::connect(&database_url)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(&mut connection)
        .await
        .map_err(|e| e.to_string())?;

    let mut transaction = connection.begin().await.map_err(|e| e.to_string())?;

    sqlx::query(
        "INSERT OR REPLACE INTO pages (id, project_id, path, name, status, order_index) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&page.id)
    .bind(&project_id)
    .bind(&page.path)
    .bind(&page.name)
    .bind(&page.status)
    .bind(order_index)
    .execute(&mut *transaction)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM blocks WHERE page_id = ?")
        .bind(&page.id)
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    for (index, block) in page.blocks.iter().enumerate() {
        sqlx::query(
            "INSERT INTO blocks (id, page_id, text, type, order_index) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(&block.id)
        .bind(&page.id)
        .bind(&block.text)
        .bind(&block.block_type)
        .bind(index as i64)
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;
    }

    sqlx::query("UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(&project_id)
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    transaction.commit().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn delete_project_data(app: AppHandle, project_id: String) -> Result<(), String> {
    let database_url = database_url(&app)?;
    let mut connection = SqliteConnection::connect(&database_url)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(&mut connection)
        .await
        .map_err(|e| e.to_string())?;

    let mut transaction = connection.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM projects WHERE id = ?")
        .bind(&project_id)
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    transaction.commit().await.map_err(|e| e.to_string())?;

    clear_project_cache(app, project_id).await
}

#[tauri::command]
async fn wipe_all_data(app: AppHandle) -> Result<(), String> {
    let database_url = database_url(&app)?;
    let mut connection = SqliteConnection::connect(&database_url)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("PRAGMA foreign_keys = ON")
        .execute(&mut connection)
        .await
        .map_err(|e| e.to_string())?;

    let mut transaction = connection.begin().await.map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM blocks")
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM pages")
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM projects")
        .execute(&mut *transaction)
        .await
        .map_err(|e| e.to_string())?;

    transaction.commit().await.map_err(|e| e.to_string())?;

    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let cache_dir = app_data_dir.join("cache");
    if cache_dir.exists() {
        fs::remove_dir_all(cache_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "
                CREATE TABLE projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    chapter TEXT,
                    status TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE pages (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    path TEXT NOT NULL,
                    name TEXT NOT NULL,
                    status TEXT NOT NULL,
                    order_index INTEGER NOT NULL,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );

                CREATE TABLE blocks (
                    id TEXT PRIMARY KEY,
                    page_id TEXT NOT NULL,
                    text TEXT NOT NULL,
                    type TEXT NOT NULL,
                    order_index INTEGER NOT NULL,
                    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
                );
            ",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mangai.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            check_ollama_status,
            start_ollama,
            cache_image,
            clear_project_cache,
            list_chapter_images,
            save_page_atomic,
            delete_project_data,
            wipe_all_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
