# Diretrizes do Projeto MangAI Translator

## 1. Repositórios Remotos e Publicação (CRÍTICO)
- **Produção / Principal (`public`)**: `https://github.com/Zentsy/MangAItranslator.git`
  - Este é o repositório OFICIAL de produção.
  - A branch principal é `master`.
  - É aqui que vivem as releases públicas, os instaladores (`.exe`) e o endpoint do auto-updater (`latest.json`).
  - **SEMPRE** que for realizar um release, atualizar a versão de produção ou criar tags (`v*`), o push **DEVE OBRIGATORIAMENTE** ser enviado para `public master` e a tag para `public <tag>`:
    ```powershell
    git push public master
    git push public <tag>
    ```
- **Desenvolvimento (`origin`)**: `https://github.com/Zentsy/mangAITranslator-DEV.git`
  - Repositório secundário/espelho de desenvolvimento (`origin/master` e `origin/main`).

## 2. Identidade Visual & UI/UX
- Identidade visual densa e artesanal inspirada em **Nanquim, Pena G e Papel Washi** (mangá tradicional).
- **Morte ao minimalismo**: Proibido designs minimalistas, genéricos, ou temas futuristas/sci-fi.
- **Alertas e Notificações**: Sempre utilizar a identidade visual customizada do projeto para diálogos, modais e alertas. NUNCA utilizar `window.alert()` ou componentes nativos do sistema operacional / plugins nativos do Tauri.

## 3. Versionamento Semântico Baseado em Fases
- Toda fase equivale a um incremento de `0.x.0` (ex: Fase 2 = `v0.2.0`, Fase 3 = `v0.3.0`, Fase 4 = `v0.4.0`).
- Fechamento de ciclo maior equivale a `x.0.0` (ex: `v1.0.0`).
- A versão deve ser rigorosamente consistente entre `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `SettingsView.tsx` e o roadmap.

## 4. Transparência de Arquivos Modificados
- Toda resposta que criar ou alterar arquivos DEVE listar explicitamente no final quais arquivos foram afetados (ex: "Modified file X, Created file Y").
