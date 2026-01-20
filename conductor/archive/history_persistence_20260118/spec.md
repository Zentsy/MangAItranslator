# Specification: Histórico e Persistência Local (SQLite)

## 1. Visão Geral
Esta track visa implementar um sistema de gerenciamento de projetos para o MangAItranslator. O objetivo é permitir que os usuários iniciem traduções, fechem o aplicativo e retomem o trabalho exatamente de onde pararam, com todos os blocos e configurações preservados em um banco de dados local.

## 2. Requisitos Funcionais
- **Integração SQL:** Configurar o plugin `tauri-plugin-sql` para gerenciar um banco de dados SQLite local.
- **Gerenciamento de Projetos:**
    - Criar "Projetos" vinculados a um capítulo, armazenando nome da obra, número do capítulo e data.
    - Persistir todos os blocos de tradução (texto e tipo) vinculados a cada página.
- **Validação de Progresso:**
    - **Status de Página:** Cada página terá um status (`Pendente` / `Concluída`).
    - **Opção "Sem Texto":** Botão no editor para páginas sem falas. Ao ativar, a página é marcada como `Concluída` sem precisar de blocos.
- **Cache Inteligente de Imagens:**
    - Ao iniciar um projeto, as imagens são copiadas para um diretório interno de cache do app (AppData).
    - Função "Finalizar Tradução": Exporta consolidado e deleta imagens do cache.
- **Interface de Biblioteca (Estilo ReactBits):**
    - Tela de histórico com cards animados.
    - Barra de progresso visual baseada nas páginas marcadas como `Concluída`.
    - Sistema de busca por nome da obra.

## 3. Requisitos Não-Funcionais
- **Integridade:** Banco de dados atualizado a cada alteração de bloco.
- **Eficiência:** Limpeza rigorosa do cache para poupar o SSD do usuário.

## 4. Tecnologias
- Tauri Plugin SQL (SQLite).
- Zustand (com integração SQL).
- ReactBits (Componentes visuais para Biblioteca).
