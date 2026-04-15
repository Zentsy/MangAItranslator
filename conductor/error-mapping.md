# Error Mapping - MangAItranslator (MVP)

Este documento mapeia os erros conhecidos do sistema e as ações de remediação aplicadas.

| Código/Erro | Causa Provável | Feedback ao Usuário | Ação do Sistema |
| :--- | :--- | :--- | :--- |
| **HTTP 429** | Limite de cota do Gemini Free Tier (15 RPM) atingido. | "Limite de requisições atingido. Aguarde alguns segundos." | Interrompe retries automáticos. |
| **HTTP 401** | API Key do Gemini inválida ou expirada. | "Chave de API inválida." | Exibe erro e limpa input de chave. |
| **ERR_CONNECTION_REFUSED** | Falha no protocolo de assets do Tauri (comum no Windows). | Imagem não carrega (broken icon). | Necessita prefixo `\\?\` ou ajuste no `assetProtocol`. |
| **Permission Error (Dialog)** | Falta de permissão no `default.json` (Tauri v2). | Console: `dialog.message not allowed`. | Adicionar permissões ao `capabilities/default.json`. |
| **Malformed JSON** | IA enviou texto extra ou markdown fora das chaves. | "Erro no processamento da resposta da IA." | `cleanJson` no `geminiService` tenta isolar o objeto. |

## Futuras Melhorias
- [ ] Implementar Toasts (sonner ou shadcn) para erros não bloqueantes.
- [ ] Adicionar logging em arquivo via Rust para diagnósticos remotos.
