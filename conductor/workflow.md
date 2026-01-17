# Workflow - MangAItranslator

## 1. Desenvolvimento e Qualidade
- **Cobertura de Testes:** Meta mínima de 50%. Foco em lógica de tradução, processamento de sinais e utilitários centrais.
- **Estilo de Código:** Seguir rigorosamente os guias em `conductor/code_styleguides/`.

## 2. Controle de Versão (Git)
- **Frequência de Commits:** Commits não são automáticos por tarefa. O Conductor deve sugerir commits apenas em marcos importantes ou quando solicitado pelo usuário.
- **Privacidade:** O repositório deve permanecer privado. Nenhuma informação pessoal ou chaves locais devem ser incluídas.
- **Resumo de Tarefas:** Utilizar mensagens de commit detalhadas para registrar o progresso importante.

## 3. Protocolo de Verificação de Fase
Ao finalizar uma fase do plano, o Conductor deve:
1. Executar testes existentes.
2. Solicitar verificação manual do usuário para elementos visuais e de interface.
3. Sugerir um commit de checkpoint.