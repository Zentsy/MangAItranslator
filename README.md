# MangAI Translator

Desktop app para localizacao assistida de manga e quadrinhos.

O foco do app e simples: importar um capitulo, gerar um rascunho com IA, revisar bloco por bloco e exportar o resultado sem perder o contexto da pagina.

## Download

Baixe a versao para Windows em [GitHub Releases](https://github.com/Zentsy/MangAItranslator/releases).

O usuario final nao precisa instalar `Node.js`, `Rust` ou rodar comando no terminal.

## O que o app faz

- importa uma pasta inteira do capitulo ou puxa as paginas vizinhas a partir de uma unica imagem
- salva projetos localmente para continuar depois
- gera rascunho com `Gemini` ou `Ollama`
- permite revisar, reorganizar e editar blocos manualmente
- exporta em `.txt` e `.docx`
- checa novas versoes no proprio app

## Melhor forma de usar hoje

- `Gemini`: melhor experiencia para a maioria das pessoas
- `Ollama`: opcao local/offline, mas pode ser bem mais lenta em maquinas modestas

## Screenshots

### Home

![Home do MangAI Translator](screenshots/retomar.png)

### Editor

![Editor com revisao de blocos](screenshots/editor.png)

### Exportacao

![Modal de exportacao](screenshots/exportar.png)

### Modelos

![Selecao de modelos e motores](screenshots/modelos.png)

### Tema claro

![Dashboard no tema claro](screenshots/tema%20branco%20-%20home.png)

## Fluxo rapido

1. Escolha `Gemini` ou `Ollama`.
2. Importe um capitulo.
3. Gere o `AI Draft`.
4. Revise os blocos no editor.
5. Exporte em `.txt` ou `.docx`.

## Como funcionam os motores

### Gemini

- usa a sua propria chave da API
- e a opcao recomendada para qualidade e velocidade
- a chave e usada localmente no app para falar direto com a API do Google

### Ollama

- roda localmente no seu PC
- e util para uso offline ou mais privado
- o desempenho depende bastante da maquina e do modelo escolhido

## Desenvolvimento

### Requisitos

- `Node.js`
- `Rust`
- dependencias do Tauri instaladas no sistema

### Rodando em desenvolvimento

```bash
npm install
npm run tauri -- dev
```

### Build rapido

```bash
npm run build
cd src-tauri
cargo check
```

## Status do projeto

O app ja esta funcional para uso real em Windows, mas continua em fase de beta. O foco atual e polir a experiencia, validar o updater e corrigir bugs de uso real conforme a comunidade testar.

## Uso responsavel

Use o app apenas em materiais proprios, licenciados ou para os quais voce tenha permissao de localizacao/traducao.
