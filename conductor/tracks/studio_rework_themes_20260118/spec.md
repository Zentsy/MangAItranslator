# Specification: Manga Studio Rework & Temas

## 1. Visão Geral
Esta track visa transformar a interface atual do MangAItranslator de um protótipo básico para um ambiente imersivo de edição de mangá. O objetivo é remover a sensação de "vazio" através de painéis flutuantes inspirados em softwares de arte e implementar um sistema de temas baseado em gêneros de mangá (Shonen, Seinen).

## 2. Requisitos Funcionais
- **Rework de Layout (Layout Magnético):**
    - Implementar painéis de ferramentas que começam ancorados mas podem ser destacados.
    - Adicionar elementos decorativos ("Greebles") como marcas de corte de manuscrito e réguas de escala.
- **Sistema de Temas (Gêneros):**
    - **Seinen (Manga Noir):**
        - Paleta: Ebonite Black (#121212) e Cinza Chumbo.
        - Estilo: Bordas duplas de 2px, sombras pesadas (Hard Shadows), tipografia serifada clássica.
        - ReactBits: `DecryptedText` para logs e metadados.
    - **Shonen (Kinetic Nitro):**
        - Paleta: Deep Space Blue (#0F172A) com acentos em Amarelo Elétrico (#FACC15).
        - Estilo: Cantos chanfrados (clip-path), inclinação de 2 graus nos containers, efeitos de brilho (Ki Glow).
        - ReactBits: `SplitText` com animações de impacto.
- **Configurações de UI:**
    - Botão de "Toggle Performance" para desativar overlays de ruído/grão e animações elásticas.

## 3. Requisitos Técnicos
- **CSS Avançado:** Uso de `clip-path`, `skew` e variáveis CSS dinâmicas para troca de tema.
- **Animações:** Diferenciar entre animações lentas/lineares (Seinen) e elásticas/rápidas (Shonen).
- **ReactBits:** Integração de `DecryptedText`, `SplitText` e `VariableProximity`.
