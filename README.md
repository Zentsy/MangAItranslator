# MangAI Translator

App desktop para traducao assistida de manga e quadrinhos, com foco em importar paginas, gerar um rascunho por IA, revisar bloco por bloco e exportar o resultado final.

## O que o app faz

- importa um capitulo inteiro a partir de uma pasta ou de uma pagina
- salva o projeto localmente para continuar depois
- gera rascunho com `Gemini` ou `Ollama`
- permite revisar, reorganizar e editar blocos manualmente
- exporta em `.txt` e `.docx`

## Melhor forma de usar hoje

- `Gemini`: melhor experiencia para a maioria das pessoas
- `Ollama`: opcao local/offline, mas pode ficar lenta em PCs mais modestos

## Tecnologias

- `React + Vite + TypeScript`
- `Tauri + Rust`
- `SQLite local`

## Rodando em desenvolvimento

### Requisitos

- `Node.js`
- `Rust`
- dependencias do Tauri instaladas no sistema

### Instalar dependencias

```bash
npm install
```

### Rodar o app

```bash
npm run tauri -- dev
```

### Build de producao

```bash
npm run build
cd src-tauri
cargo check
```

## Gerando o instalador Windows

Para distribuir como app de verdade no Windows, o fluxo e gerar o instalador do Tauri:

```bash
$env:TAURI_SIGNING_PRIVATE_KEY="$env:USERPROFILE\.tauri\mangai-updater.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
npm run tauri -- build --bundles nsis
```

O artefato principal do beta fica em:

```text
src-tauri/target/release/bundle/nsis/
```

O usuario final nao precisa rodar `npm`, `Node.js` ou `Rust`. Ele so baixa o instalador gerado e abre o app normalmente.

## Atualizacoes automaticas

O app agora esta preparado para checar atualizacoes pelo `latest.json` publicado no GitHub Releases.

- endpoint configurado: `https://github.com/Zentsy/MangAItranslator/releases/latest/download/latest.json`
- updater assinado com chave publica no `tauri.conf.json`
- instalacao no Windows em modo `passive`

### O que voce precisa configurar uma vez

1. Gerar sua chave privada do updater localmente:

```bash
npm run tauri -- signer generate -w "$env:USERPROFILE\.tauri\mangai-updater.key"
```

2. Guardar essa chave com cuidado.

Se voce perder a chave privada, as proximas atualizacoes automaticas deixam de funcionar para quem ja instalou o app.

### GitHub Actions

O repo ja tem workflow em `.github/workflows/release.yml` para publicar releases com o `tauri-action`.

Configure estes secrets no GitHub:

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

### Importante sobre o canal de update

Como o app usa `releases/latest/download/latest.json`, a release que vai alimentar o updater precisa ser uma release normal do GitHub.

- `draft`: nao entra no canal automatico
- `prerelease`: tambem pode ficar fora do `latest`

Se quiser chamar de beta, tudo bem. So nao marque a release como `prerelease` no GitHub se quiser que o updater pegue essa versao.

## Como testar rapido

1. Abra o app.
2. Escolha `Gemini` ou `Ollama`.
3. Importe um capitulo.
4. Gere o rascunho da pagina.
5. Revise os blocos no editor.
6. Exporte o projeto em `.txt` ou `.docx`.

## Estado atual

Este projeto esta em fase de beta fechado/aberto inicial. A base principal ja funciona, mas o foco atual ainda e polish, clareza de UX e empacotamento para release.

## Observacoes

- os projetos ficam salvos localmente neste computador
- o app ainda esta sendo refinado para release publica
- se voce usar `Ollama`, o desempenho depende bastante da sua maquina e do modelo escolhido

## Licenca e uso

Use o app apenas em materiais proprios, licenciados ou para os quais voce tenha permissao de localizacao/traducao.
