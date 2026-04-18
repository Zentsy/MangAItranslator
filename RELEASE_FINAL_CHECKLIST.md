# Release Final Checklist

Checklist enxuto para levar o `MangAI Translator` do estado atual para um beta publico utilizavel no Windows.

## 1. Antes do push

- [ ] Confirmar que o app abre normalmente pelo instalador mais recente.
- [ ] Confirmar que a home, editor, export e settings estao ok.
- [ ] Confirmar que `Verificar atualizacao` mostra `Canal de atualizacao ainda nao publicado`.
- [ ] Conferir se o nome/publisher no Windows aparece como `MangAI Translator` / `Zentsy`.
- [ ] Conferir se nao existe nenhuma chave real ou arquivo sensivel no repo.

## 2. Chave do updater

- [ ] Decidir se a chave atual sem senha vai continuar.
- [ ] Fazer backup de `C:\Users\levib\.tauri\mangai-updater.key`.
- [ ] Fazer backup de `C:\Users\levib\.tauri\mangai-updater.key.pub`.

Importante:

- Se essa chave for perdida, o canal de update quebra para as instalacoes que ja sairam.
- Se quiser trocar a chave, o melhor momento e antes da primeira release publica com updater.

## 3. GitHub secrets

Configurar no repo:

- [ ] `TAURI_SIGNING_PRIVATE_KEY`
- [ ] `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

Observacao:

- Hoje a chave foi gerada sem senha. Nesse caso o secret de password pode ficar vazio, mas ainda vale a pena decidir isso conscientemente.

## 4. Push e workflow

- [ ] Fazer push da branch `codex/mvp-foundation`.
- [ ] Confirmar que `.github/workflows/release.yml` esta no remoto.
- [ ] Escolher como vai sair a primeira publicacao:
  - opcao A: tag `v0.1.0`
  - opcao B: merge e depois tag

Regra importante:

- A release que vai alimentar o updater precisa ser uma release normal.
- Nao publicar como `draft`.
- Nao publicar como `prerelease`, senao o `latest.json` pode nao cair no canal esperado.

## 5. Primeira release publica

- [ ] Publicar a primeira release com o workflow.
- [ ] Confirmar se os assets de release subiram corretamente.
- [ ] Confirmar se `latest.json` ficou acessivel em:

```text
https://github.com/Zentsy/MangAItranslator/releases/latest/download/latest.json
```

- [ ] Baixar o instalador da release no GitHub e instalar como usuario normal.
- [ ] Abrir o app instalado e testar `Verificar atualizacao`.

Resultado esperado da primeira release:

- Como ainda nao existe versao mais nova, o app deve abrir normalmente.
- Depois da publicacao correta, a checagem deixa de mostrar `canal nao publicado`.
- Ela deve passar a mostrar `sem atualizacao por enquanto`.

## 6. Teste real do updater

Depois da `v0.1.0` publicada:

- [ ] Fazer uma mudanca pequena e segura.
- [ ] Subir `0.1.1`.
- [ ] Publicar release normal.
- [ ] Abrir a `0.1.0` instalada.
- [ ] Clicar em `Verificar atualizacao`.
- [ ] Confirmar se aparece o modal de nova versao.
- [ ] Confirmar se o download/instalacao funcionam.

Esse e o teste que realmente valida o fluxo fim a fim.

## 7. Itens que nao bloqueiam, mas merecem atencao

- [ ] Warning de bundle grande no Vite.
- [ ] `npm audit` ainda acusa uma vulnerabilidade alta transitiva em `picomatch`.
- [ ] Revisar se queremos log/telemetria no futuro para bugs de beta.

## 8. Pacote minimo para anuncio

- [ ] README atualizado
- [ ] screenshots no repo
- [ ] setup mais recente testado
- [ ] updater configurado
- [ ] mensagem curta de anuncio pronta

## Ordem recomendada

1. Push
2. Secrets
3. Primeira release normal
4. Validar `latest.json`
5. Testar app instalado
6. Soltar `0.1.1` para validar updater real
