@echo off
title MangAI Translator - Dev Runner
echo [1/3] Verificando dependencias do Frontend...
call npm install

echo.
echo [2/3] Iniciando o ambiente de desenvolvimento Tauri...
echo O app abrira em alguns instantes.
echo Se for a primeira vez, a compilacao do Rust pode demorar alguns minutos.
echo.

call npm run tauri dev

echo.
echo [3/3] App encerrado.
pause
