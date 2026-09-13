# Site gratuito para baixar o MangAI Translator

Este repositório mantém o app desktop separado do site público:

- `src/` continua sendo o app Tauri/React.
- `site/index.html` é uma landing page estática, independente, só para apresentar o app e mandar a pessoa para o download.
- `site/assets/` contém a logo nova e screenshots copiadas da pasta `screenshots/`, incluindo `configs_v2.png`.

## Como ver localmente

No Windows, a forma mais direta é:

```powershell
python -m http.server 4173 --directory site
```

Depois abra:

```text
http://127.0.0.1:4173/
```

## Como publicar no GitHub Pages (Já configurado com a branch gh-pages)

A branch `gh-pages` já foi gerada e enviada para os remotes `public` e `origin`. Ela contém o bundle standalone unificado (`index.html`) e o arquivo `.nojekyll`.

### Ativação no repositório GitHub:
1. Acesse: `https://github.com/Zentsy/MangAItranslator/settings/pages`
2. Na seção **Build and deployment**:
   - **Source**: Selecione `Deploy from a branch`
   - **Branch**: Selecione `gh-pages` e pasta `/ (root)`
   - Clique no botão **Save**.
3. O GitHub Pages iniciará a publicação imediatamente. Em cerca de 30 a 60 segundos, o site estará no ar na URL oficial:
   **`https://zentsy.github.io/MangAItranslator/`**

---

## Alertas e Boas Práticas

- **Zero dependências externas**: O bundle é compilado via `vite-plugin-singlefile`, contendo todos os componentes, scripts e estilos em um arquivo único.
- **Imagens e Assets**: As screenshots e logos são consumidas via CDN direta do repositório oficial no GitHub.
- **Link de Download**: O botão principal direciona para a release oficial estável `v0.3.0` e para a página de releases mais recente (`/releases/latest`).

