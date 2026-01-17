# Specification: Estrutura Base e Workflow de Fila

## 1. Escopo
Esta track foca na criação da base técnica e da interface principal do MangAItranslator. O objetivo é permitir que o usuário carregue um conjunto de imagens, visualize-as em uma fila e utilize uma interface lado a lado para tradução assistida por IA (Ollama/translategemma) com o sistema de sinais convencionado.

## 2. Requisitos Funcionais
- **Configuração do Ambiente:** Inicialização do projeto Tauri + React + TypeScript + Tailwind.
- **Gestão de Fila:** Upload de múltiplas imagens com pré-visualização em miniatura.
- **Interface Lado a Lado:** Painel esquerdo com a imagem original e painel direito com editor de texto enriquecido.
- **Integração Ollama:** Detecção automática do serviço e modelo, com interface de configuração caso offline.
- **Sistema de Sinais:** Lógica de processamento de texto para suportar `[]`, `{}`, `()`, `//`.
- **Estética Cyber-Organic:** Implementação do tema escuro com texturas de retículas e animações ReactBits.

## 3. Requisitos Não-Funcionais
- **Performance:** Uso de Web Workers para não travar a UI durante o processamento de imagens.
- **Privacidade:** Local-first, sem envio de dados para nuvem.
- **Responsividade:** Interface otimizada para uso em telas de desktop.

## 4. Tecnologias
- Tauri (Backend Rust para gerenciamento de arquivos e Ollama).
- React (Frontend).
- Zustand (Estado da fila e configurações).
- Framer Motion (Transições e efeitos).
- Shadcn/ui + ReactBits (Componentes visuais).
