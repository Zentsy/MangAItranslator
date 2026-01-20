use std::fs;
use std::path::Path;
use std::process::Command;
use tauri::{AppHandle, Manager};
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn check_ollama_status() -> Result<bool, String> {
    let output = if cfg!(target_os = "windows") {
        Command::new("powershell")
            .args(["-Command", "Invoke-WebRequest -Uri http://localhost:11434/api/tags -Method Get -UseBasicParsing"])
            .output()
    } else {
        Command::new("curl")
            .args(["-I", "http://localhost:11434"])
            .output()
    };

    match output {
        Ok(out) => Ok(out.status.success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn start_ollama() -> Result<String, String> {
    if cfg!(target_os = "windows") {
        Command::new("powershell")
            .args(["-Command", "Start-Process ollama -ArgumentList 'serve' -NoNewWindow"])
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    } else {
        Command::new("ollama")
            .arg("serve")
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    }
}

// Comandos para gerenciar o cache de imagens
#[tauri::command]
async fn cache_image(app: AppHandle, project_id: String, image_path: String) -> Result<String, String> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
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
        }
    ];

    tauri::Builder::default()
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
            clear_project_cache
        ])
        .run(tauri::generate_context!());
}
