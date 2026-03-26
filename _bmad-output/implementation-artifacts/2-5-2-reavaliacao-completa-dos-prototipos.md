# Story 2.5.2: Reavaliação Completa dos Protótipos

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a equipe de desenvolvimento do Caderninho,
I want uma reavaliação completa de todos os protótipos HTML, corrigindo inconsistências e criando uma tabela de regras canônicas,
so that os protótipos sejam uma fonte de verdade visual confiável — com sidebar único, formatação padronizada, versões mobile e desktop separadas — antes de unificar o Design System (Story 2.5.3).

## Contexto

A retrospectiva do Épico 2 (`epic-2-retro-2026-03-24.md`) identificou que os protótipos HTML são inconsistentes entre si:
- **Cada protótipo tem sidebar diferente** — nenhum reflete a implementação real
- **Valores monetários**: alguns mostram `R$ 3.000`, outros `R$ 3.000,00`
- **Percentuais**: alguns mostram `25%`, outros `25,03%`
- **Mobile e desktop misturados**: tem telas só mobile, só desktop, e casos onde parecem sistemas diferentes
- **Tokens visuais** (botões, espaçamentos, cores) divergem entre protótipos de épocas diferentes

**Resultado:** Três fontes de verdade conflitantes (protótipos, DS, código). Dev não sabe qual seguir.

**Cadeia de dependência:** 2.5.1 (done) → **2.5.2** → 2.5.3 → 2.5.4 → 2.5.5 → 2.5.6 → 2.5.7

## Acceptance Criteria

### AC 1: Inventário Completo de Protótipos

**Given** existem 28 arquivos HTML na pasta `_bmad-output/prototypes/`
**When** a reavaliação é executada
**Then** cada arquivo é classificado como:
- **Canônico** (proto-01 a proto-15 + categories-ux-v2): protótipos de telas reais do app
- **Exploratório** (visual-*, ux-design-*, design-system-comparison): arquivos de exploração e comparação usados durante decisões de design
**And** para cada protótipo canônico, existe um registro com: nome, tela representada, status (ok / precisa corrigir), breakpoints cobertos (mobile / desktop / ambos), lista de findings

### AC 2: Regras Canônicas de Formatação

**Given** a reavaliação identificou inconsistências de formatação
**When** as regras são definidas
**Then** uma tabela de regras canônicas é criada cobrindo TODOS os seguintes itens:

| Aspecto | Regra Canônica | Exemplo |
|---------|---------------|---------|
| Valores monetários | Sempre com 2 decimais, separador de milhar com ponto | `R$ 3.000,00` |
| Percentuais | Sempre com 2 decimais | `25,03%` |
| Sidebar desktop | Mesmo sidebar em todos os protótipos desktop (alinhado com implementação real) | Sidebar colapsável 220px/56px |
| Bottom nav mobile | Mesma bottom nav em todos os protótipos mobile | Bottom nav com FAB central 48px |
| Fonte | Inter com `font-variant-numeric: tabular-nums` para valores financeiros | Números alinhados em colunas |
| Paleta de cores | Stone & Indigo conforme DS implementado | `stone-50` a `stone-950`, `indigo-500` a `indigo-700` |
| Espaçamento base | Múltiplos de 4px | `4px, 8px, 12px, 16px, 24px, 32px` |
| Breakpoints | Mobile (< 768px) e Desktop (>= 1024px) separados | Cada tela tem 2 protótipos |
| Botões | Componentes shadcn/ui (não botões HTML nativos) | Button com variants default/secondary/destructive |
| Inputs | Componentes shadcn/ui com labels consistentes | Input com label acima, placeholder padronizado |
| Cards | Estrutura consistente: header, content, footer opcionais | Card com border-radius, shadow, padding padronizados |
| Estados vazios | Padrão único de empty state | Ícone + título + descrição + CTA |
| Skeleton screens | Toda tela com loading state | Skeleton com pulse animation |

### AC 3: Sidebar Único

**Given** cada protótipo desktop tem sidebar diferente
**When** os protótipos são corrigidos
**Then** TODOS os protótipos desktop usam o mesmo sidebar
**And** o sidebar reflete a implementação real atual: colapsável (220px expandido, 56px recolhido), com itens de navegação corretos
**And** os itens do sidebar refletem as funcionalidades implementadas + as que serão implementadas nos épicos futuros (com indicação visual de "futuro" se necessário)

### AC 4: Valores Monetários Padronizados

**Given** existem valores monetários em diferentes formatos nos protótipos
**When** os protótipos são corrigidos
**Then** TODOS os valores monetários em TODOS os protótipos usam o formato `R$ X.XXX,XX` (sempre 2 decimais)
**And** a fonte é Inter com `tabular-nums` para alinhamento visual
**And** valores negativos usam `-R$ X.XXX,XX` (sinal antes do R$)

### AC 5: Percentuais Padronizados

**Given** existem percentuais em diferentes formatos nos protótipos
**When** os protótipos são corrigidos
**Then** TODOS os percentuais em TODOS os protótipos usam o formato `XX,XX%` (sempre 2 decimais)

### AC 6: Versões Mobile e Desktop Separadas

**Given** alguns protótipos cobrem apenas 1 breakpoint ou misturam mobile/desktop
**When** a reavaliação é concluída
**Then** CADA tela canônica tem versão mobile E versão desktop separadas
**And** se um protótipo existente cobre apenas mobile, a versão desktop é criada (ou vice-versa)
**And** a diferença entre versões é explícita: mobile usa bottom nav + layout vertical, desktop usa sidebar + layout horizontal

### AC 7: Tokens Visuais Unificados

**Given** tokens visuais divergem entre protótipos de épocas diferentes
**When** os protótipos são corrigidos
**Then** TODOS os protótipos usam os mesmos design tokens:
- Cores: paleta Stone & Indigo
- Tipografia: Inter (regular 400, medium 500, semibold 600, bold 700)
- Border-radius: consistente (default 8px para cards, 6px para inputs, 4px para badges)
- Shadows: shadow-sm para cards elevados, nenhum para cards flat
- Espaçamento: grid base 4px

### AC 8: Documento de Saída

**Given** a reavaliação está completa
**When** o resultado é documentado
**Then** o documento de saída contém:
1. Tabela de regras canônicas (AC 2)
2. Inventário completo com findings por protótipo (AC 1)
3. Lista de protótipos corrigidos
4. Lista de protótipos novos criados (versões mobile/desktop faltantes)
5. Mapeamento protótipo → tela do app → epic/story que implementa

## Tasks / Subtasks

### Parte 1: Definição das Regras Canônicas

- [x] Task 1: Criar tabela de regras canônicas (AC: #2)
  - [x] 1.1: Analisar o design system implementado (página `/design-system`) para extrair tokens atuais
  - [x] 1.2: Analisar a UX design specification para extrair convenções definidas
  - [x] 1.3: Analisar a arquitetura para extrair convenções técnicas (formatação de valores, etc.)
  - [x] 1.4: Compilar tabela de regras canônicas cobrindo todos os itens do AC 2
  - [x] 1.5: Salvar como `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md`

### Parte 2: Inventário e Avaliação dos Protótipos Canônicos

- [x] Task 2: Inventariar e avaliar cada protótipo canônico (AC: #1)
  - [x] 2.1: Avaliar `proto-01-login.html` — breakpoints, formatação, tokens, sidebar
  - [x] 2.2: Avaliar `proto-02-signup.html`
  - [x] 2.3: Avaliar `proto-03-link-account.html`
  - [x] 2.4: Avaliar `proto-04-permissions.html`
  - [x] 2.5: Avaliar `proto-05-dashboard-desktop.html`
  - [x] 2.6: Avaliar `proto-06-dashboard-mobile.html`
  - [x] 2.7: Avaliar `proto-07-cascade-input.html`
  - [x] 2.8: Avaliar `proto-08-onboarding.html`
  - [x] 2.9: Avaliar `proto-09-budgets.html`
  - [x] 2.10: Avaliar `proto-10-checklist.html`
  - [x] 2.11: Avaliar `proto-11-projection.html`
  - [x] 2.12: Avaliar `proto-12-credit-card.html`
  - [x] 2.13: Avaliar `proto-13-reconciliation.html`
  - [x] 2.14: Avaliar `proto-14-settings.html`
  - [x] 2.15: Avaliar `proto-15-drill-down.html`
  - [x] 2.16: Avaliar `categories-ux-v2.html`

- [x] Task 3: Classificar protótipos exploratórios (AC: #1)
  - [x] 3.1: Classificar `design-system-comparison.html`, `ux-design-directions.html`, `visual-*` como exploratórios
  - [x] 3.2: Determinar quais exploratórios podem ser arquivados (decisões já tomadas)

### Parte 3: Correção dos Protótipos — Sidebar Único

- [x] Task 4: Definir o sidebar canônico (AC: #3)
  - [x] 4.1: Documentar a implementação real do sidebar (componente `Sidebar.tsx`)
  - [x] 4.2: Criar snippet HTML/CSS do sidebar canônico para reuso nos protótipos

- [x] Task 5: Aplicar sidebar canônico em todos os protótipos desktop (AC: #3)
  - [x] 5.1: Substituir sidebar em cada protótipo desktop que tenha sidebar diferente

### Parte 4: Correção dos Protótipos — Formatação

- [x] Task 6: Padronizar valores monetários (AC: #4)
  - [x] 6.1: Em cada protótipo, encontrar e corrigir todos os valores monetários para o formato `R$ X.XXX,XX`
  - [x] 6.2: Garantir `tabular-nums` na fonte de valores financeiros

- [x] Task 7: Padronizar percentuais (AC: #5)
  - [x] 7.1: Em cada protótipo, encontrar e corrigir todos os percentuais para o formato `XX,XX%`

### Parte 5: Criação de Versões Faltantes (Mobile/Desktop)

- [x] Task 8: Identificar telas com versão faltante (AC: #6)
  - [x] 8.1: Mapear quais protótipos canônicos cobrem apenas mobile, apenas desktop, ou ambos
  - [x] 8.2: Priorizar criação das versões faltantes para as telas dos Épicos 1 e 2 (já implementadas)

- [x] Task 9: Criar versões faltantes (AC: #6) — N/A
  - [x] 9.1: Todas as telas canônicas já cobrem ambos os breakpoints (desktop + mobile)
  - [x] 9.2: proto-05/proto-06 formam o par Dashboard desktop+mobile
  - [x] 9.3: categories-ux-v2 é suplementar — proto-14 já cobre categorias em ambos breakpoints

### Parte 6: Unificação de Tokens Visuais

- [x] Task 10: Padronizar tokens em todos os protótipos (AC: #7)
  - [x] 10.1: Substituir cores ad-hoc pela paleta Stone & Indigo do DS
  - [x] 10.2: Padronizar tipografia (Inter, pesos corretos, tabular-nums)
  - [x] 10.3: Padronizar border-radius, shadows e espaçamento
  - [x] 10.4: Substituir botões HTML nativos por estilo shadcn/ui

### Parte 7: Documento de Saída e Mapeamento

- [x] Task 11: Gerar documento de saída (AC: #8)
  - [x] 11.1: Compilar inventário completo com findings por protótipo
  - [x] 11.2: Listar protótipos corrigidos e novos criados
  - [x] 11.3: Criar mapeamento protótipo → tela → epic/story
  - [x] 11.4: Salvar como `_bmad-output/planning-artifacts/reavaliacao-prototipos.md`

### Review Follow-ups (AI) — Code Review R1 (2026-03-25)

- [x] [AI-Review][CRITICAL] C-1: Preencher File List no Dev Agent Record — 25 arquivos documentados (8 novos + 17 modificados)
- [x] [AI-Review][CRITICAL] C-2: Preencher Agent Model Used — substituído placeholder por modelos reais usados
- [x] [AI-Review][HIGH] H-1: ~~Substituir SVG BookText por `✎`~~ — **REJEITADO PELO PO**: protótipos devem manter o SVG BookText (ícone de caderneta), igual ao onboarding. Os 10 protótipos já usam SVG correto. Snippets e regras atualizados para refletir SVG em vez de ✎.
- [x] [AI-Review][MEDIUM] M-1: Atualizar snippets canônicos e regras canônicas — "Sair" adicionado como 6° item da bottom nav; logo do sidebar atualizado de ✎ para SVG BookText em ambos os docs
- [x] [AI-Review][MEDIUM] M-2: Atualizar status do action items review doc de "Pendente" para "Concluído"

## Dev Notes

### Natureza da Story: UX/Design — Não é Código de Produção

Esta story é **primariamente UX/Design**. O output é:
1. Documento de regras canônicas (`.md`)
2. Protótipos HTML corrigidos/novos (`.html`)
3. Documento de inventário e mapeamento (`.md`)

**NÃO** envolve mudanças no código de produção (src/). Toda mudança é em `_bmad-output/`.

### Inventário Atual de Protótipos

**Canônicos (16 arquivos)** — representam telas reais do app:

| Arquivo | Tela | Épico | Status Implementação |
|---------|------|-------|---------------------|
| `proto-01-login.html` | Login | 1 | Implementado (Story 1.4) |
| `proto-02-signup.html` | Cadastro | 1 | Implementado (Story 1.4) |
| `proto-03-link-account.html` | Vincular conta bancária | 2 | Implementado (Story 2.1) |
| `proto-04-permissions.html` | Permissões | 8 | Futuro |
| `proto-05-dashboard-desktop.html` | Dashboard (desktop) | 6 | Futuro |
| `proto-06-dashboard-mobile.html` | Dashboard (mobile) | 6 | Futuro |
| `proto-07-cascade-input.html` | Registro de gasto (cascade) | 3 | Futuro |
| `proto-08-onboarding.html` | Onboarding wizard | 2 | Implementado (Story 2.6) |
| `proto-09-budgets.html` | Orçamentos por categoria | 3 | Futuro |
| `proto-10-checklist.html` | Checklist mensal | 4 | Futuro |
| `proto-11-projection.html` | Projeção futura/timeline | 7 | Futuro |
| `proto-12-credit-card.html` | Detalhe cartão de crédito | 5 | Futuro |
| `proto-13-reconciliation.html` | Reconciliação de fatura | 5 | Futuro |
| `proto-14-settings.html` | Configurações | — | Futuro |
| `proto-15-drill-down.html` | Drill-down analítico | 6 | Futuro |
| `categories-ux-v2.html` | Categorias/subcategorias | 2 | Implementado (Story 2.4) |

**Exploratórios (12 arquivos)** — usados durante decisões de design (candidatos a arquivamento):

| Arquivo | Propósito | Decisão Tomada? |
|---------|-----------|----------------|
| `design-system-comparison.html` | Comparar opções de DS | Sim (Stone & Indigo escolhido) |
| `ux-design-directions.html` | Direções de design | Sim |
| `visual-bill-notification.html` | Explorar visual de notificações | Alimenta proto-10 |
| `visual-checklist.html` | Explorar visual do checklist | Alimenta proto-10 |
| `visual-compare-layout-hybrid.html` | Comparar layouts | Sim |
| `visual-compare-layout.html` | Comparar layouts | Sim |
| `visual-compare-typography.html` | Comparar tipografias | Sim (Inter escolhido) |
| `visual-credit-card-detail.html` | Explorar detalhe de cartão | Alimenta proto-12 |
| `visual-direction-a-slate-teal.html` | Direção A | Sim (não escolhida) |
| `visual-direction-b-stone-indigo.html` | Direção B | Sim (escolhida) |
| `visual-direction-c-zinc-emerald.html` | Direção C | Sim (não escolhida) |
| `visual-treemap-finviz.html` | Explorar treemap | Alimenta proto-15 |

### Problemas Conhecidos da Retro (o que procurar)

1. **Sidebar diferente em cada protótipo** — comparar com implementação real em `src/client/components/layout/Sidebar.tsx`
2. **Valores sem 2 decimais** — `R$ 3.000` deve ser `R$ 3.000,00`
3. **Percentuais sem 2 decimais** — `25%` deve ser `25,03%`
4. **Versões mobile/desktop faltantes** — verificar quais protótipos cobrem apenas 1 breakpoint
5. **Botões HTML nativos** — devem parecer shadcn/ui
6. **Cores ad-hoc** — devem ser da paleta Stone & Indigo
7. **Espaçamento irregular** — deve seguir grid base 4px
8. **Fonte não-Inter** — toda tipografia deve ser Inter

### Referência: Sidebar Implementado

Verificar o componente em `src/client/components/layout/Sidebar.tsx` para extrair:
- Itens de navegação atuais
- Larguras (expandido 220px, recolhido 56px)
- Visual (cores, ícones, hover states)

### Referência: Design System Implementado

Verificar a página `/design-system` em `src/app/design-system/page.tsx` para extrair:
- Paleta de cores atual
- Tipografia e pesos
- Componentes e suas variantes
- Tokens de espaçamento

### Referência: Formatação de Valores (Convenção do Código)

Do `project-context.md`:
- Valores monetários em integer cents: R$ 149,99 → `14999`
- Divisão por 100 apenas na camada de apresentação
- `tabular-nums` obrigatório para valores financeiros

Do `MEMORY.md` (UI Patterns):
- Input monetário: estilo app bancário, usuário digita só números, vírgula posiciona automaticamente
- Input percentual: mesmo padrão

### Lições da Story 2.5.1 (Previous Story Intelligence)

- **661 → 663 testes** — crescimento mínimo, story foi mais de UX/ajustes que de backend
- **BankLogo** criado com padrão análogo a `CreditCardBrandBadge` — padrão replicável para outros componentes visuais
- **Override de payment method por subcategoria** implementado — protótipos de categorias devem refletir essa funcionalidade
- **Code review convergiu em 2 rounds** — processo maduro
- **Drizzle-kit generate OBRIGATÓRIO** — nunca criar SQL manual (não relevante para esta story, mas boa lembrança)

### Git Intelligence (Últimos Commits Relevantes)

- Story 2.5.1 concluída com BankLogo e override de payment method
- Story 2.7 (auditoria visual) já corrigiu alguns desvios visuais
- Design system page criada e tokens corrigidos

### Project Structure Notes

- Todas as mudanças são em `_bmad-output/` — zero impacto no código de produção
- Protótipos ficam em `_bmad-output/prototypes/`
- Documentos de planning ficam em `_bmad-output/planning-artifacts/`
- Nenhum conflito com a estrutura do projeto

### References

- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#O Que Não Deu Certo] — Problemas com protótipos inconsistentes
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Épico 2.5] — Definição da Story 2.5.2
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Acordo de Time] — 4 Barreiras de Design System
- [Source: _bmad-output/project-context.md#Technology Stack] — Stack e versões
- [Source: _bmad-output/project-context.md#Critical Don't-Miss Rules] — Regras de formatação financeira
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Tokens] — Tokens visuais definidos
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Estrategia de Plataforma] — 3 contextos de uso (registro, gestão, consulta)
- [Source: _bmad-output/planning-artifacts/architecture.md] — Convenções de naming e formatação
- [Source: _bmad-output/implementation-artifacts/2-5-1-decisoes-de-produto-e-ajustes-de-modelo.md] — Story anterior concluída
- [Source: src/client/components/layout/Sidebar.tsx] — Sidebar implementado (referência canônica)
- [Source: src/app/design-system/page.tsx] — Design system implementado (referência canônica)

## Dev Agent Record

### Agent Model Used

Claude Opus 4 (claude-opus-4-20250514) — implementação original
Claude Opus 4.6 (claude-opus-4-6) — review follow-ups

### Debug Log References

Nenhum debug necessário — story é UX/Design, sem código de produção.

### Completion Notes List

- ✅ Resolved review finding [CRITICAL] C-1: File List preenchido com 25 arquivos (8 novos + 17 modificados)
- ✅ Resolved review finding [CRITICAL] C-2: Agent Model Used preenchido (Opus 4 original + Opus 4.6 follow-ups)
- ✅ Resolved review finding [HIGH] H-1: REJEITADO PELO PO — protótipos já usam SVG BookText correto. Snippets e regras atualizados para refletir SVG em vez de ✎
- ✅ Resolved review finding [MEDIUM] M-1: Snippets e regras atualizados — "Sair" como 6° item da bottom nav, logo sidebar como SVG BookText
- ✅ Resolved review finding [MEDIUM] M-2: Status do action items review doc atualizado de "Pendente" para "Concluído"

### Change Log

- **2026-03-24**: Implementação completa da reavaliação — Tasks 1-11 concluídas (regras canônicas, inventário, sidebar unificado, formatação padronizada, tokens visuais, documento de saída)
- **2026-03-25**: Addressed code review findings — 5 items resolvidos (2 CRITICAL, 1 HIGH rejeitado pelo PO, 2 MEDIUM)
- **2026-03-25**: Code review R2 — todos os 5 fixes validados e aprovados. Story marcada como done.

### File List

**Novos (A):**
- `_bmad-output/implementation-artifacts/2-5-2-reavaliacao-completa-dos-prototipos.md` (este arquivo)
- `_bmad-output/implementation-artifacts/2-5-2-action-items-review.md`
- `_bmad-output/implementation-artifacts/2-5-2b-atualizacao-prototipos-modelo-v2.md`
- `_bmad-output/planning-artifacts/decisao-modelo-categorizacao-v2.md`
- `_bmad-output/planning-artifacts/reavaliacao-prototipos.md`
- `_bmad-output/planning-artifacts/regras-canonicas-prototipos.md`
- `_bmad-output/planning-artifacts/snippets-canonicos-prototipos.md`
- `_bmad-output/prototypes/proto-12a-credit-cards-list.html`

**Modificados (M):**
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/prototypes/categories-ux-v2.html`
- `_bmad-output/prototypes/proto-01-login.html`
- `_bmad-output/prototypes/proto-02-signup.html`
- `_bmad-output/prototypes/proto-03-link-account.html`
- `_bmad-output/prototypes/proto-04-permissions.html`
- `_bmad-output/prototypes/proto-05-dashboard-desktop.html`
- `_bmad-output/prototypes/proto-06-dashboard-mobile.html`
- `_bmad-output/prototypes/proto-07-cascade-input.html`
- `_bmad-output/prototypes/proto-08-onboarding.html`
- `_bmad-output/prototypes/proto-09-budgets.html`
- `_bmad-output/prototypes/proto-10-checklist.html`
- `_bmad-output/prototypes/proto-11-projection.html`
- `_bmad-output/prototypes/proto-12-credit-card.html`
- `_bmad-output/prototypes/proto-13-reconciliation.html`
- `_bmad-output/prototypes/proto-14-settings.html`
- `_bmad-output/prototypes/proto-15-drill-down.html`
