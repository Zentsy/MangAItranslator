use std::process::Command;
use tauri::AppHandle;

#[tauri::command]
fn check_ollama_status() -> Result<bool, String> {
    // Tenta fazer um request simples para a porta padrão do Ollama
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
        // Tenta iniciar o Ollama no Windows
        Command::new("powershell")
            .args(["-Command", "Start-Process ollama -ArgumentList 'serve' -NoNewWindow"])
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    } else {
        // Para outros sistemas (macOS/Linux)
        Command::new("ollama")
            .arg("serve")
            .spawn()
            .map_err(|e| format!("Falha ao iniciar Ollama: {}", e))?;
        Ok("Comando de inicialização enviado".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![check_ollama_status, start_ollama])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}