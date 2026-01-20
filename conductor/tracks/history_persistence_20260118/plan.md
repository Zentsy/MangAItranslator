# Implementation Plan: Histórico e Persistência Local (SQLite)

## Fase 1: Infraestrutura de Dados
- [x] Task: Configurar Tauri Plugin SQL e SQLite
    - [x] Adicionar dependências no `Cargo.toml` e `package.json`
    - [x] Definir Schema do Banco de Dados (Tabelas: projects, pages, blocks)
- [x] Task: Criar Camada de Repositório (Services)
    - [x] Implementar funções de CRUD para Projetos e Blocos
- [x] Task: Conductor - User Manual Verification 'Infraestrutura de Dados' (Protocol in workflow.md)

## Fase 2: Lógica de Cache e Projetos
- [x] Task: Implementar Gerenciador de Cache de Imagens no Rust
    - [x] Função para copiar imagens para o AppData al iniciar projeto
    - [x] Função para limpar cache de um projeto finalizado
- [x] Task: Integrar Store (Zustand) com Persistência SQL
    - [x] Garantir que toda alteração em um bloco dispare um "upsert" no banco
- [x] Task: Conductor - User Manual Verification 'Lógica de Cache e Projetos' (Protocol in workflow.md)

## Fase 3: Interface da Biblioteca e Refinamentos
- [x] Task: Criar Tela de Biblioteca (Histórico)
    - [x] Implementar Grid de cards usando componentes ReactBits
    - [x] Adicionar funcionalidade de Busca e Barra de Progresso
- [x] Task: Atualizar Editor com Opção "Sem Texto"
    - [x] Adicionar botão de alternância e lógica de status de conclusão
- [ ] Task: Implementar Botão "Finalizar Projeto"
    - [ ] Lógica de exportação final + limpeza de cache + marcar projeto como concluído
- [ ] Task: Conductor - User Manual Verification 'Interface da Biblioteca e Refinamentos' (Protocol in workflow.md)

## Fase 4: Finalização e Verificação
- [ ] Task: Executar testes de integração para persistência (>50% cobertura)
- [ ] Task: Sugerir commit de checkpoint final da track
- [ ] Task: Conductor - User Manual Verification 'Finalização e Verificação' (Protocol in workflow.md)
