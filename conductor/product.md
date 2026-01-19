# MangAItranslator - Guia do Produto

## 1. Visão Geral
O MangAItranslator é uma plataforma desktop (WebView/App Nativo) desenvolvida em React, projetada para automatizar e otimizar o fluxo de trabalho de grupos de tradução de mangás (Scanlators). Combina visão computacional com um sistema de edição supervisionado para garantir traduções precisas e bem formatadas.

## 2. Público-Alvo
*   **Scanlators (Grupos de Tradução):** Foco em agilizar a tradução inicial e o type-setting.
*   **Tradutores Independentes:** Gestão de tradução e revisão em interface integrada.

## 3. Funcionalidades Principais
*   **Processamento em Fila:** Upload em massa de páginas de capítulos.
*   **Editor Supervisionado por Blocos:** A IA extrai o texto em blocos individuais, permitindo que o usuário ordene, edite e aplique sinais de scanlation (`[]`, `{}`, `()`, `//`) com um clique.
*   **Tradução via IA (Gemini/Ollama):** Suporte nativo à API do Gemini (2.5 Flash) para traduções de alta performance e suporte a modelos locais via Ollama.
*   **Interface Lado a Lado:** Imagem original com zoom/pan profissional e editor de blocos lateral.
*   **Exportação Consolidada:** Geração de arquivo `.txt` único com todas as páginas traduzidas e formatadas.

## 4. Diferenciais Técnicos
*   **Controle de Qualidade:** Workflow "Human-in-the-loop" onde a IA faz o rascunho e o humano valida a estrutura.
*   **Privacidade e Flexibilidade:** Opção de usar chaves de API seguras ou modelos locais.