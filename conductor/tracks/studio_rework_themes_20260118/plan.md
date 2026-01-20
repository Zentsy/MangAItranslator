# Implementation Plan: Manga Studio Rework & Temas

## Fase 1: Infraestrutura de Temas
- [ ] Task: Implementar Sistema de Variáveis CSS Dinâmicas
    - [ ] Definir tokens de cores, sombras e inclinações para Seinen e Shonen
    - [ ] Criar Contexto de Tema no React para troca global
- [ ] Task: Integrar Componentes Base do ReactBits
    - [ ] Configurar `DecryptedText`, `SplitText` e `VariableProximity` no projeto
- [ ] Task: Conductor - User Manual Verification 'Infraestrutura de Temas' (Protocol in workflow.md)

## Fase 2: Rework de Layout (Manga Studio)
- [ ] Task: Implementar Painéis Magnéticos/Flutuantes
    - [ ] Criar componente `DraggablePanel` para ferramentas e blocos
    - [ ] Lógica de ancoragem lateral
- [ ] Task: Adicionar Detalhamento Visual ("Greebles")
    - [ ] Implementar marcas de corte de manuscrito nas bordas
    - [ ] Adicionar réguas de escala e metadados decorativos
- [ ] Task: Conductor - User Manual Verification 'Rework de Layout' (Protocol in workflow.md)

## Fase 3: Estilização dos Gêneros
- [ ] Task: Implementar Visual Seinen (Manga Noir)
    - [ ] Aplicar bordas duplas, sombras pesadas e overlay de grão (Grain)
    - [ ] Configurar tipografia Crimson Text/Inter
- [ ] Task: Implementar Visual Shonen (Kinetic Nitro)
    - [ ] Aplicar cantos chanfrados (clip-path) e inclinação de 2 graus
    - [ ] Adicionar padrões de Halftone e efeitos de Ki Glow
- [ ] Task: Criar Modo de Performance (Performance Toggle)
- [ ] Task: Conductor - User Manual Verification 'Estilização dos Gêneros' (Protocol in workflow.md)

## Fase 4: Finalização e Polimento
- [ ] Task: Garantir consistência visual em todas as telas (Dashboard, Biblioteca, Editor)
- [ ] Task: Sugerir commit de checkpoint final da track
- [ ] Task: Conductor - User Manual Verification 'Finalização e Polimento' (Protocol in workflow.md)
