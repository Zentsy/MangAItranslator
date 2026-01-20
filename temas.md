# Theme: Seinen (Manga Noir)
**Concept:** Psychological Depth & Raw Textures

### Paleta de Cores
- **Base:** `#121212` (Ebonite Black - Remete à tinta nanquim densa).
- **Surface:** `#1C1C1C` (Papel de prensagem fria escuro).
- **Secondary:** `#A3A3A3` (Cinza chumbo para metadados).
- **Accent:** `#8B0000` (Oxblood Red - Usado parcimoniosamente para estados de erro ou alertas críticos).

### Tipografia
- **Headings:** `Crimson Text` ou `Playfair Display` (Serifas clássicas que evocam literatura e gravidade).
- **Body:** `Inter` (Medium weight) para legibilidade técnica.

### UI Atoms & Principles
- **Borders:** `2px solid #262626`. Use bordas duplas em elementos de destaque para simular quadros de mangá clássicos.
- **Shadows:** "Hard Shadows" puras. Sem blur. Ex: `box-shadow: 4px 4px 0px 0px rgba(0,0,0,1)`.
- **Texturas:** Adicione um overlay de ruído (Grain) de 2% sobre toda a interface para simular a textura do papel.
- **Micro-interações:** Transições lentas (300ms+) de opacidade. Nada de "pulos" ou animações elásticas.

### Layout
- **Grid:** Assimétrica. Os elementos não precisam estar perfeitamente alinhados, simulando a quebra de painéis em momentos de tensão.

———————————————————————————————————————————————————————————————


# Theme: Shounen (Kinetic Nitro)
**Concept:** Energy, Impact & Speed

### Paleta de Cores
- **Base:** `#0F172A` (Deep Space Blue).
- **Surface:** `#1E293B`.
- **Primary Accent:** `#FACC15` (Electric Yellow - Para CTAs e elementos ativos).
- **Secondary Accent:** `#FB923C` (Energy Orange).

### Tipografia
- **Headings:** `Archivo Black` ou `Impact` (Fontes "Heavy" e levemente inclinadas/Italic para passar ideia de velocidade).
- **Body:** `Space Grotesk` (Geométrica e moderna).

### UI Atoms & Principles
- **Angles:** Use `clip-path` para criar botões e cards com cantos chanfrados (diagonais). Nada de retângulos perfeitos.
- **Halftone Patterns:** Use padrões de pontos (dot matrix) em fundos de botões e hover states para referenciar a impressão de revistas Shonen Jump.
- **Glow:** Efeitos de "Neon Glow" (`drop-shadow`) em volta de elementos ativos, simulando "Aura/Ki".
- **Micro-interações:** Animações "Spring" (elásticas) e rápidas. Elementos devem "quicar" na tela.

### Layout
- **Grid:** Diagonal/Slanted. Use transformações de `skewX(-2deg)` em containers principais para criar uma sensação de urgência e dinamismo.

———————————————————————————————————————————————————————————————

# Theme: Shoujo (Ethereal Dreamscape)
**Concept:** Emotional Transparency & Fluidity

### Paleta de Cores
- **Base:** `#FFF5F7` (Soft Petal White).
- **Surface:** `rgba(255, 255, 255, 0.6)` (Glassmorphism total).
- **Primary Accent:** `#FFB7C5` (Sakura Pink).
- **Secondary Accent:** `#B39DDB` (Soft Lavender).

### Tipografia
- **Headings:** `Cormorant Garamond` (Serifa extremamente elegante, leve e itálica).
- **Body:** `Montserrat` (Light weight, tracking aumentado).

### UI Atoms & Principles
- **Glassmorphism:** Uso intensivo de `backdrop-filter: blur(12px)`. A interface deve parecer feita de vidro fosco ou cristais.
- **Borders:** Gradientes lineares sutis (Pink para Lavender) com apenas `1px` de espessura.
- **Shapes:** Círculos e formas orgânicas/curvas. Evite ângulos retos. `border-radius: 24px` ou mais.
- **Flares:** Pequenos elementos decorativos de "brilho" (star flares) que aparecem aleatoriamente no fundo ou ao clicar.

### Layout
- **Grid:** "Floating Layout". Os componentes não devem parecer presos a uma grade rígida; eles devem flutuar com muito respiro (whitespace) entre eles.