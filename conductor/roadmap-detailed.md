# Roadmap Detalhado - MangAItranslator

Este documento detalha as fases de desenvolvimento do MangAItranslator, focando em objetivos técnicos, entregas e critérios de sucesso para cada "Track".

---

## 🏗️ Track 0: Fundação & Estabilidade (Concluída)
*Foco: Garantir que o app funcione sem erros críticos e que os dados estejam seguros.*

- **Build & Tipagem:** Sincronização de contratos entre Rust (Tauri) e TypeScript.
- **Persistência Atômica:** Implementação de `save_page_atomic` para evitar corrupção de dados no SQLite durante quedas de energia ou crashes.
- **Motores Iniciais:** Integração funcional com Gemini (API) e Ollama (Local).
- **Gestão de Ativos:** Sistema de cache de imagens com limpeza automática ao deletar projetos.

---

## 🎨 Track 1: UX & Fluxo de Trabalho (Em Andamento)
*Foco: Produtividade do tradutor e experiência de uso "nativa".*

- [x] **Exportação Multi-formato:** Suporte para `.txt` (legível) e `.docx` (estruturado com cores por tipo de balão).
- [x] **Sistema de Diálogos:** Substituição de downloads de navegador por janelas nativas de "Salvar Como".
- [x] **Painel de Controle:** Central de configurações (`SettingsView`) com gestão de chaves e manutenção.
- [x] **Onboarding Humano:** Guia visual inicial para configuração de chave e primeira importação.
- [ ] **Atalhos de Teclado (Editor):**
    - `Ctrl + Enter`: Confirmar bloco e ir para o próximo.
    - `Tab / Shift+Tab`: Navegar entre blocos.
    - `Ctrl + S`: Forçar salvamento (mesmo com debounce).
    - `F1/F2`: Trocar tipo do bloco selecionado.
- [ ] **Feedback de Processamento:** Melhorar indicadores de "IA Pensando" para evitar que o usuário ache que o app travou.

---

## 🧩 Track 2: Modularidade & Expansão (Próxima Fase)
*Foco: Preparar o app para ser customizável e suportar o ecossistema de IAs.*

- **Sistema de Temas (CSS Variables):**
    - Migração de classes fixas (ex: `bg-[#0a0a0a]`) para variáveis (ex: `var(--app-bg)`).
    - Criação de pelo menos 2 temas: *Dark Organic* (Atual) e *Paper/Light* (Focado em leitura).
- **Suporte Multi-IA:**
    - Refatoração do `translationService` para aceitar adaptadores.
    - Integração com **OpenRouter** (para acessar Claude/DeepSeek via API).
    - Configurações avançadas de "System Prompt" para tradutores experientes.
- **Gestão de Memória Local:**
    - Interface para limpar cache de imagens de projetos específicos sem deletar o projeto.
    - Estimativa de espaço em disco ocupado na aba de Configurações.

---

## 🔐 Track 3: Segurança & Refinamento Profissional
*Foco: Privacidade do usuário e polimento final.*

- **Criptografia de Chaves:** Proteção das chaves de API em repouso no `localStorage` ou migração para o `Keytar` (OS Keychain).
- **Validação de Projetos:** Verificação automática de integridade ao abrir um projeto antigo.
- **OCR Avançado:** Opção para o usuário "forçar" o reconhecimento de uma área específica que a IA ignorou.
- **Modo Offline:** Garantir que o app funcione 100% (exceto Gemini) se a internet cair.

---

## 🚀 Track 4: Comunidade & Lançamento (Release)
*Foco: Levar o MangAItranslator para o mundo.*

- **Landing Page Estática:** Página simples explicando o valor do app e link para download do instalador.
- **Programa Piloto:** Seleção de 5 Scanlators para teste real de 1 capítulo completo.
- **Manual de Uso:** Guia rápido de sinais (`[]`, `{}`, `()`) e atalhos.
- **V1.0.0 Stable:** Primeiro release público oficial.

---

## 📝 Notas de Manutenção
- **Padrão de Código:** Sempre manter o `GEMINI.md` atualizado com novas regras de UI.
- **Performance:** Monitorar o uso de memória do Tauri com muitas imagens carregadas.
- **Localização:** Todo texto novo DEVE ir para o `src/locales/pt.json`.
