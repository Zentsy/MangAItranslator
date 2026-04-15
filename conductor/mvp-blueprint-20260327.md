## 1. Conceito do produto em uma frase

MangAItranslator e um app desktop para tradutores de manga/quadrinhos que transforma paginas em blocos editaveis com rascunho por IA, revisao humana e exportacao pronta para o fluxo de scanlation/localizacao.

## 2. Usuario alvo e problema

- Usuario principal: scanlator/tradutor independente BR ou dupla pequena que traduz capitulos com volume baixo a medio.
- Problema central: traduzir capitulos ainda exige muito copia-e-cola, perda de ordem de leitura, retrabalho manual e pouca consistencia no arquivo final.
- Gambiarra atual: abrir imagens em um viewer, mandar imagem para Gemini/ChatGPT/Google Tradutor, reorganizar falas na mao e montar um TXT separado para typesetting.
- Por que importa agora: o app ja tem espinha dorsal funcional, mas precisa virar um fluxo confiavel e simples o bastante para ser anunciado para a comunidade.

## 3. Objetivo do MVP

Provar que um usuario consegue pegar um capitulo real, gerar um rascunho util, revisar os blocos e exportar um arquivo final com menos friccao e menos retrabalho do que no fluxo manual atual.

## 4. Restricoes e suposicoes

- Restricoes:
  - O produto atual e desktop-first em Tauri; migrar para web agora aumentaria muito escopo.
  - O build atual esta quebrado por drift de tipos e existem lacunas de confiabilidade em salvamento local.
  - Custos de IA sao variaveis; pagar API para todo mundo desde o dia 1 e arriscado.
  - Posicionamento publico focado em "scanlation monetizada" aumenta risco juridico e comercial.
- Suposicoes:
  - O primeiro lancamento deve ser focado em Windows desktop com biblioteca local.
  - O idioma e publico inicial sao PT-BR.
  - O usuario aceita revisar o resultado da IA; precisao perfeita nao e requisito do MVP.
  - O modelo de entrada do MVP deve ser gratis com BYOK Gemini e opcao local via Ollama.
- Desconhecidos para validar cedo:
  - Se o usuario prefere bloco estruturado ou texto corrido com marcacoes.
  - Se a maior dor esta na traducao em si ou na organizacao/exportacao.
  - Se existe vontade real de pagar por conveniencia gerenciada em vez de usar propria chave.

## 5. Escopo do MVP vs depois

### MVP

- Upload de capitulo com ordenacao correta de paginas.
- Biblioteca local com retomada de projeto.
- Cache local confiavel das imagens.
- AI Draft por pagina com ordem de leitura e retorno em blocos.
- Editor de blocos com edicao, reordenacao, marcacoes `[]`, `{}`, `()`, `//`.
- Exportacao consolidada em `.txt`.
- Escolha clara do motor: Gemini por chave propria e Ollama local.
- Salvamento confiavel, build verde e fluxo sem perda de dados.
- Onboarding simples para primeira traducao.

### Depois

- Web app.
- Ads.
- Billing completo com creditos e top-up.
- Colaboracao em equipe, sync em nuvem e contas.
- Glossario por obra, memoria de traducao e consistencia por personagem.
- OCR/redraw/typesetting automatico visual dentro da imagem.
- Multi-idioma amplo, analytics detalhado e painel admin.

## 6. Backlog priorizado

| Prioridade | Item | Por que agora | Dependencias | Sinal de validacao |
| --- | --- | --- | --- | --- |
| Must | Corrigir build e contrato de tipos | Sem build verde nao existe MVP anunciavel | Nenhuma | `npm run build` passa |
| Must | Tornar salvamento transacional e debounced | Evita perda de dados e travamento ao digitar | Build verde | Usuario revisa capitulo sem corromper blocos |
| Must | Fechar fluxo Gemini + Ollama com seletor de engine | MVP precisa ter opcao barata e opcao local | Estabilidade basica | Usuario escolhe motor e conclui 1 capitulo |
| Must | Validar parse da resposta da IA com retry simples | Reduz falhas silenciosas do rascunho | Engine integrada | Menos erros de JSON/ordem quebrada |
| Must | Limpeza correta de cache ao deletar/finalizar projeto | Evita lixo em disco e inconsistencias | Biblioteca local | Projetos deletados nao deixam residuos |
| Should | Melhorar onboarding inicial | Diminui abandono no primeiro uso | Core flow estavel | Usuario novo entende o fluxo sem pedir ajuda |
| Should | Atalhos de teclado e UX de blocos | Acelera uso real por scanlators | Editor estavel | Usuario fecha capitulo mais rapido |
| Should | Pagina de landing + mensagem de posicionamento | Necessario para anunciar sem prometer demais | Proposta clara | Pessoas entendem valor em 10 segundos |
| Could | Telemetria local/anonima opt-in | Ajuda a priorizar depois do lancamento | Core flow pronto | Dados de uso orientam backlog |
| Won't now | Ads, web app e colaboracao | Alto escopo e baixo aprendizado imediato | Nenhuma | Mantido fora do MVP |

## 7. Roadmap curto

- Semana 1: corrigir build, contrato de tipos, salvamento transacional e limpeza de cache.
- Semana 2: fechar fluxo de AI Draft com Gemini/Ollama, parse validado e UX minima do editor.
- Semana 3: onboarding, polish do fluxo principal, exportacao confiavel e testes smoke.
- Semana 4: landing/posicionamento, piloto com usuarios reais, ajustes de usabilidade e pacote de anuncio.

## 8. Riscos e plano de validacao

- Riscos de produto:
  - Tentar servir muitos perfis ao mesmo tempo. O v1 deve servir uma pessoa que traduz um capitulo de cada vez.
  - Lancar com promessa ampla demais ("traduz manga automaticamente") e frustrar a comunidade.
- Riscos tecnicos:
  - Parse de IA fragil.
  - Ordem de leitura inconsistente.
  - Escrita frequente no SQLite causando lag ou perda.
- Riscos operacionais:
  - Custos de API saindo do controle se voce bancar tudo no inicio.
  - Risco juridico/comercial se o app for vendido como ferramenta para monetizar obra sem autorizacao.
- O que validar primeiro:
  - Se 5 usuarios alvo conseguem terminar 1 capitulo real e dizem que o app economiza tempo.
  - Se o fluxo BYOK/local ja gera valor suficiente para o usuario voltar.
- Passo de validacao mais barato:
  - Entregar build desktop para 5 scanlators/tradutores BR, acompanhar 1 capitulo completo por pessoa e coletar feedback por Discord/WhatsApp com 3 perguntas fixas: onde travou, onde economizou tempo, o que faltou para usar de novo.

## 9. Proximos passos

1. Consertar build e estabilidade do salvamento local.
2. Fechar o seletor de engine e o fluxo Gemini/Ollama ponta a ponta.
3. Definir posicionamento publico como ferramenta de localizacao assistida, nao como produto para monetizar scanlation.
4. Montar um piloto fechado com 5 usuarios da comunidade antes de divulgar amplamente.
5. So depois do piloto escolher monetizacao e pagina publica.

## Nota de monetizacao

- Recomendacao para o MVP:
  - Gratis com BYOK Gemini.
  - Gratis com Ollama local.
  - Sem ads no app.
- Recomendacao para a primeira camada paga, depois de uso real:
  - Plano "Pro" com conveniencia e limites claros: API gerenciada por voce, fila prioritaria, modelos melhores, e credito mensal incluso.
  - Top-up opcional para heavy users.
- O que evitar agora:
  - Ads como monetizacao principal.
  - "Ilimitado" usando API paga por voce.
  - Web app so para viabilizar ads.

## Fontes externas usadas nesta revisao

- Google Gemini API pricing e billing:
  - https://ai.google.dev/gemini-api/docs/pricing
  - https://ai.google.dev/gemini-api/docs/billing/
- Direitos autorais sobre traducao/obra derivada:
  - https://www.copyright.gov/circs/circ14.pdf
  - https://blogs.loc.gov/copyright/2022/10/copyright-in-translation-gregory-rabassa/
  - https://antigo.bn.gov.br/es/node/256
- Referencias de comunidade sobre monetizacao de AI SaaS:
  - https://www.reddit.com/r/SaaS/comments/1mjjz3l/how_do_you_charge_for_ai_usage/
  - https://www.reddit.com/r/SaaS/comments/1oqdper/creditbased_pricing_vs_flatmonthly_unlimited/
  - https://www.reddit.com/r/SaaS/comments/1r6mibk/if_your_saas_relies_on_ai_models_how_are_you/
  - https://www.indiehackers.com/post/help-needed-in-pricing-my-saas-product-b9b29a1ffe
