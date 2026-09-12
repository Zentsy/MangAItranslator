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

## Como publicar de graça

### GitHub Pages

1. Configure o GitHub Pages para publicar a pasta `site` ou copie o conteúdo dela para a branch/pasta usada pelo Pages.
2. O arquivo principal precisa continuar sendo `index.html`.
3. A URL gratuita normalmente fica em um subdomínio do GitHub Pages.

### Cloudflare Pages, Netlify ou Vercel

1. Crie um projeto apontando para este repositório.
2. Configure a pasta de publicação como `site`.
3. Não use comando de build para esta landing, porque ela é HTML/CSS puro.

## Alertas importantes

- Para ficar 100% grátis, use o subdomínio gratuito do provedor. Domínio próprio normalmente é pago.
- Não coloque backend só para uma página de download. Para esta necessidade, HTML/CSS estático é suficiente.
- O botão de download aponta para `https://github.com/Zentsy/MangAItranslator/releases/latest`. Publique os instaladores nessa página de releases para o link funcionar bem.
