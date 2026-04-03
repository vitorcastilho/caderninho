# Story 2.5.6: Component Library — Componentes Novos (Épico 3)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a desenvolvedor do Caderninho,
I want criar os componentes UI novos necessários para o Épico 3 (Registro e Gestão de Transações) na component library com testes e presença no Design System,
so that as stories do Épico 3 importem componentes prontos e testados, sem criar UI ad-hoc nas telas.

## Contexto

A Story 2.5.5 extraiu componentes duplicados (CurrencyInput, PercentageInput, EmptyState, PageHeader). Esta story cria **componentes novos** que ainda não existem no codebase mas são necessários para o Épico 3.

A UX Spec define 14 custom components divididos em 3 fases. Esta story implementa os **5 componentes da Fase 1 (Core/MVP)**:

1. **BudgetProgressBar** — barra de progresso de orçamento com semáforo de cores (Stories 3.6, 3.1)
2. **SummaryCard** — card compacto de métricas para dashboard e resumos (Stories 3.4, 3.6)
3. **ImpactPreview** — preview de impacto antes de confirmar ações (Stories 3.1, 3.3, 3.5)
4. **BottomNavigation** — navegação mobile com FAB central (Story 3.1 — abre CascadeInput)
5. **CascadeInput** — fluxo de registro em cascata com progressive disclosure (Story 3.1)

**Todos são componentes puramente apresentacionais** — sem backend, sem Server Actions, sem banco de dados. Recebem dados via props e emitem eventos via callbacks. A integração com dados reais acontece no Épico 3.

**Cadeia de dependência:** 2.5.1 → 2.5.2 → 2.5.2b → 2.5.3 → 2.5.4 → 2.5.5 (done) → **2.5.6** → 2.5.7

## Acceptance Criteria

### AC 1: BudgetProgressBar

**Given** qualquer tela que precisa exibir progresso de orçamento
**When** o desenvolvedor importa `<BudgetProgressBar>`
**Then** o componente renderiza uma barra horizontal com preenchimento proporcional (gasto/limite)
**And** a cor segue escala semântica: verde (< 70%), amarelo (70-85%), laranja (85-100%), vermelho (> 100%)
**And** aceita props: `spent: number` (centavos), `budget: number` (centavos), `label?: string`, `showValues?: boolean`, `showPercentage?: boolean`, `variant?: 'inline' | 'expanded' | 'mini'`
**And** variante `inline`: barra + label + porcentagem em uma linha (para dentro de cards)
**And** variante `expanded`: barra + label + valores "R$ X / R$ Y" + porcentagem + status badge
**And** variante `mini`: apenas barra sem texto (para summary cards)
**And** usa `formatCurrency` de `@/client/utils/format-currency` para exibir valores
**And** tem `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
**And** está renderizado na página `/design-system`

### AC 2: SummaryCard

**Given** qualquer área de resumo ou dashboard
**When** o desenvolvedor importa `<SummaryCard>`
**Then** o componente renderiza um card compacto com: label, valor principal, indicador de tendência opcional
**And** aceita props: `label: string`, `value: string`, `trend?: 'positive' | 'negative' | 'neutral'`, `trendLabel?: string`, `icon?: LucideIcon`, `variant?: 'default' | 'compact'`
**And** trend `positive` exibe seta para cima + verde, `negative` seta para baixo + vermelho, `neutral` sem seta
**And** usa `<Card>` de shadcn/ui como base
**And** tem `aria-label` descritivo (ex: "Saldo Total: R$ 5.200,00, tendência positiva")
**And** está renderizado na página `/design-system`

### AC 3: ImpactPreview

**Given** qualquer ação que afeta valores (registro de gasto, reclassificação, edição)
**When** o desenvolvedor importa `<ImpactPreview>`
**Then** o componente exibe: valores antes/depois, barras de orçamento afetadas, alerta se ultrapassa limite
**And** aceita props:
- `items: Array<{ label: string; before: number; after: number; budget?: number }>` (centavos)
- `variant?: 'inline' | 'sheet'`
- `warningThreshold?: number` (porcentagem, default 100 = estoura orçamento)
**And** cada item mostra label + "R$ antes → R$ depois" com seta colorida (verde se diminui, vermelho se aumenta gasto)
**And** se algum item tem `budget`, renderiza `<BudgetProgressBar variant="mini">` com o valor `after`
**And** se `after > budget`, exibe badge de alerta "Excede orçamento"
**And** border-left 4px com cor: `border-indigo-500` (normal), `border-orange-500` (atenção), `border-red-500` (excede)
**And** tem `role="alert"` com `aria-label` descritivo do impacto
**And** está renderizado na página `/design-system`

### AC 4: BottomNavigation

**Given** o layout mobile do aplicativo
**When** o desenvolvedor importa `<BottomNavigation>`
**Then** o componente renderiza barra fixa no bottom com 5 itens: Dashboard, Orçamentos, FAB (+), Checklist, Projeção
**And** aceita props:
- `activeItem: string` (key do item ativo)
- `onNavigate: (key: string) => void`
- `onFabClick: () => void` (abre CascadeInput)
- `badges?: Record<string, number>` (notificação por item)
**And** item ativo usa cor indigo, inativos cinza (stone-400)
**And** FAB central (+) é botão circular 48px fundo indigo, ícone branco, elevado sobre a barra
**And** badge de notificação renderiza bolinha vermelha com número (max "9+")
**And** tem `role="navigation"` e `aria-current="page"` no item ativo
**And** está renderizado na página `/design-system`

### AC 5: CascadeInput

**Given** a necessidade de registro rápido de transações (~5 segundos)
**When** o desenvolvedor importa `<CascadeInput>`
**Then** o componente implementa progressive disclosure em etapas:
- **Step 1:** Valor — campo numérico com `<CurrencyInput>`, avança quando valor > 0
- **Step 2:** Classificação + Categoria — pills de classificação + chips de categoria
- **Step 3:** Estabelecimento + Pagamento — campo texto com sugestões + seletor de método de pagamento + `<ImpactPreview>`
- **Step 4:** Confirmação — resumo com todos os campos + botão confirmar
**And** aceita props:
- `classifications: Array<{ id: string; name: string; emoji: string }>` (classificações de essencialidade)
- `categories: Array<{ id: string; name: string; classificationId: string; budget?: number }>` (categorias por classificação)
- `suggestedEstablishments?: string[]` (top 5 frequentes)
- `paymentMethods: Array<{ id: string; label: string; type: 'debit' | 'credit' | 'pix' }>` (métodos disponíveis)
- `defaultPaymentMethodId?: string` (pré-selecionado)
- `onConfirm: (data: CascadeInputData) => void`
- `onCancel: () => void`
**And** o tipo `CascadeInputData` exporta: `{ valueCents: number; classificationId: string; categoryId: string; establishment: string; paymentMethodId: string }`
**And** step indicator (dots) mostra progresso: ativo (indigo), completo (check), pendente (cinza)
**And** botão "Voltar" navega para step anterior, "Cancelar" fecha
**And** validação inline: valor = 0 desabilita avançar, categoria obrigatória
**And** cada step tem `aria-label` e `aria-live="polite"` para mudanças
**And** está renderizado na página `/design-system` com dados mock (classificações/categorias/métodos hardcoded)

### AC 6: Testes

**Given** cada componente novo
**When** testes são executados
**Then** `BudgetProgressBar` tem testes para: renderização, 4 faixas de cor (< 70%, 70-85%, 85-100%, > 100%), 3 variantes (inline/expanded/mini), showValues e showPercentage, ARIA attributes
**And** `SummaryCard` tem testes para: renderização default/compact, trend positivo/negativo/neutro, com/sem ícone, aria-label
**And** `ImpactPreview` tem testes para: renderização com items, seta verde/vermelha, budget bar quando budget fornecido, badge "Excede orçamento", border colors por estado
**And** `BottomNavigation` tem testes para: renderização 5 itens, item ativo com aria-current, FAB click, navigate click, badge de notificação
**And** `CascadeInput` tem testes para: renderização step 1, avançar steps, voltar step, cancelar, confirmar emite CascadeInputData, validação (valor 0 não avança), step indicator
**And** `npm run build` passa sem erros
**And** `npm run test` passa sem regressões

### AC 7: Design System Page

**Given** todos os componentes novos
**When** a página `/design-system` é acessada
**Then** cada componente tem seção dedicada com exemplos interativos
**And** BudgetProgressBar mostra 4 exemplos (verde/amarelo/laranja/vermelho) + 3 variantes
**And** SummaryCard mostra variantes default e compact com diferentes trends
**And** ImpactPreview mostra exemplo normal, atenção e excede orçamento
**And** BottomNavigation mostra barra completa com 1 badge de notificação
**And** CascadeInput mostra fluxo interativo com dados mock (navegar entre steps)

## Tasks / Subtasks

### Fase 1: Componentes Simples (AC: #1, #2)

- [x] Task 1: Criar `BudgetProgressBar` (AC: #1)
  - [x] 1.1: Criar `src/client/components/ui/budget-progress-bar.tsx`
  - [x] 1.2: Interface de props: `spent`, `budget` (centavos), `label?`, `showValues?`, `showPercentage?`, `variant?`
  - [x] 1.3: Lógica de cor por faixa: `percentage < 70` → `bg-green-500`, `< 85` → `bg-yellow-500`, `< 100` → `bg-orange-500`, `>= 100` → `bg-red-500`
  - [x] 1.4: 3 variantes de layout: inline (single line), expanded (multiline com valores), mini (barra seca)
  - [x] 1.5: ARIA: `role="progressbar"`, `aria-valuenow={percentage}`, `aria-valuemin={0}`, `aria-valuemax={100}`
  - [x] 1.6: Usar `formatCurrency` de `@/client/utils/format-currency` para valores
  - Files: `src/client/components/ui/budget-progress-bar.tsx`

- [x] Task 2: Criar `SummaryCard` (AC: #2)
  - [x] 2.1: Criar `src/client/components/ui/summary-card.tsx`
  - [x] 2.2: Interface de props: `label`, `value`, `trend?`, `trendLabel?`, `icon?`, `variant?`
  - [x] 2.3: Usar `<Card>` de shadcn como base
  - [x] 2.4: Trend arrows: `TrendingUp` (verde) para positive, `TrendingDown` (vermelho) para negative
  - [x] 2.5: ARIA: `aria-label` com label + value + trend legível
  - Files: `src/client/components/ui/summary-card.tsx`

### Fase 2: Componentes Compostos (AC: #3, #4)

- [x] Task 3: Criar `ImpactPreview` (AC: #3)
  - [x] 3.1: Criar `src/client/components/ui/impact-preview.tsx`
  - [x] 3.2: Interface de props: `items` (array com label, before, after, budget?), `variant?`, `warningThreshold?`
  - [x] 3.3: Para cada item: label + "R$ before → R$ after" com cor da seta (verde=diminui, vermelha=aumenta)
  - [x] 3.4: Se item tem `budget`: renderizar `<BudgetProgressBar variant="mini" spent={after} budget={budget} />`
  - [x] 3.5: Badge "Excede orçamento" se `after > budget`
  - [x] 3.6: Border-left dinâmica: indigo (normal), orange (atenção >85%), red (excede >100%)
  - [x] 3.7: ARIA: `role="alert"` + `aria-label` descritivo
  - Files: `src/client/components/ui/impact-preview.tsx`

- [x] Task 4: Criar `BottomNavigation` (AC: #4)
  - [x] 4.1: Criar `src/client/components/ui/bottom-navigation.tsx`
  - [x] 4.2: Interface de props: `activeItem`, `onNavigate`, `onFabClick`, `badges?`
  - [x] 4.3: 5 itens fixos: Dashboard (LayoutDashboard), Orçamentos (PiggyBank), FAB (+), Checklist (CheckSquare), Projeção (TrendingUp)
  - [x] 4.4: FAB circular 48px elevado, bg-indigo-600 text-white
  - [x] 4.5: Badge: bolinha vermelha com número (max "9+")
  - [x] 4.6: ARIA: `role="navigation"`, `aria-current="page"` no item ativo
  - Files: `src/client/components/ui/bottom-navigation.tsx`

### Fase 3: CascadeInput (AC: #5)

- [x] Task 5: Criar `CascadeInput` (AC: #5)
  - [x] 5.1: Criar `src/client/components/ui/cascade-input.tsx`
  - [x] 5.2: Tipo exportado `CascadeInputData`: `{ valueCents, classificationId, categoryId, establishment, paymentMethodId }`
  - [x] 5.3: Interface de props: `classifications`, `categories`, `suggestedEstablishments?`, `paymentMethods`, `defaultPaymentMethodId?`, `onConfirm`, `onCancel`
  - [x] 5.4: Step 1 — Valor: usar `<CurrencyInput>`, avançar quando > 0
  - [x] 5.5: Step 2 — Classificação + Categoria: pills horizontais para classificações, grid de chips para categorias filtradas
  - [x] 5.6: Step 3 — Estabelecimento + Pagamento: input texto + sugestões + seletor de método + `<ImpactPreview>` se tiver budget na categoria
  - [x] 5.7: Step 4 — Confirmação: resumo de todos os campos + botão "Confirmar"
  - [x] 5.8: Step indicator (dots): ativo=indigo, completo=check, pendente=cinza
  - [x] 5.9: Navegação: "Voltar" para step anterior, "Cancelar" chama onCancel
  - [x] 5.10: Validação: valor = 0 desabilita avançar, categoria obrigatória
  - [x] 5.11: ARIA: `aria-label` por step, `aria-live="polite"` para mudanças
  - Files: `src/client/components/ui/cascade-input.tsx`

### Fase 4: Testes (AC: #6)

- [x] Task 6: Testes do BudgetProgressBar (AC: #6)
  - [x] 6.1: Criar `src/client/components/ui/budget-progress-bar.test.tsx`
  - [x] 6.2: Testar: 4 faixas de cor, 3 variantes, showValues, showPercentage, ARIA attributes, budget=0 edge case
  - Files: `src/client/components/ui/budget-progress-bar.test.tsx`

- [x] Task 7: Testes do SummaryCard (AC: #6)
  - [x] 7.1: Criar `src/client/components/ui/summary-card.test.tsx`
  - [x] 7.2: Testar: renderização default/compact, trend positivo/negativo/neutro, com/sem ícone, aria-label
  - Files: `src/client/components/ui/summary-card.test.tsx`

- [x] Task 8: Testes do ImpactPreview (AC: #6)
  - [x] 8.1: Criar `src/client/components/ui/impact-preview.test.tsx`
  - [x] 8.2: Testar: renderização items, setas verde/vermelha, budget bar integrada, badge excede, border colors, items vazio
  - Files: `src/client/components/ui/impact-preview.test.tsx`

- [x] Task 9: Testes do BottomNavigation (AC: #6)
  - [x] 9.1: Criar `src/client/components/ui/bottom-navigation.test.tsx`
  - [x] 9.2: Testar: renderização 5 itens, item ativo aria-current, FAB click, navigate click, badges, badge max "9+"
  - Files: `src/client/components/ui/bottom-navigation.test.tsx`

- [x] Task 10: Testes do CascadeInput (AC: #6)
  - [x] 10.1: Criar `src/client/components/ui/cascade-input.test.tsx`
  - [x] 10.2: Testar: renderização step 1, avançar para step 2/3/4, voltar step, cancelar, confirm emite CascadeInputData, valor 0 não avança, categoria obrigatória, step indicator
  - Files: `src/client/components/ui/cascade-input.test.tsx`

### Fase 5: Design System Page (AC: #7)

- [x] Task 11: Adicionar seções no Design System (AC: #7)
  - [x] 11.1: Seção BudgetProgressBar — 4 exemplos por faixa de cor (30%, 75%, 92%, 115%) + 3 variantes
  - [x] 11.2: Seção SummaryCard — 3 exemplos (positive, negative, neutral) em default + compact
  - [x] 11.3: Seção ImpactPreview — 3 exemplos (normal, atenção, excede)
  - [x] 11.4: Seção BottomNavigation — barra completa com item ativo + 1 badge
  - [x] 11.5: Seção CascadeInput — fluxo interativo com dados mock hardcoded
  - Files: `src/app/design-system/page.tsx`

### Fase 6: Validação Final (AC: #6)

- [x] Task 12: Build e testes
  - [x] 12.1: `npm run build` — zero erros
  - [x] 12.2: `npm run test` — zero regressões + novos testes passando

## Dev Notes

### Natureza da Story: Componentes Novos (Apresentacionais)

Diferente da 2.5.5 (extração de duplicados), esta story cria **componentes que ainda não existem**. Todos são puramente apresentacionais — recebem dados via props, emitem callbacks. **Zero backend, zero Server Actions, zero fetch.**

### Protótipos — Referência Visual Canônica

Consultar ANTES de implementar:

- **CascadeInput:** `_bmad-output/prototypes/proto-07-cascade-input.html` — 6 states visuais, bottom-sheet mobile, side-sheet 400px desktop
- **BudgetProgressBar:** `_bmad-output/prototypes/proto-09-budgets.html` (se existir) + `proto-07-cascade-input.html` (step 3a tem `.budget-bar-track`/`.budget-bar-fill`)
- **ImpactPreview:** `proto-07-cascade-input.html` — `.impact-preview` com `border-left: 4px solid var(--color-indigo-500)`
- **BottomNavigation:** `_bmad-output/prototypes/proto-06-dashboard-mobile.html` — barra inferior com FAB central
- **Dashboard summary cards:** `proto-05-dashboard-desktop.html` e `proto-06-dashboard-mobile.html`

### Padrões CSS do Protótipo (CascadeInput)

Extraídos de `proto-07-cascade-input.html`:

```css
/* Budget bar */
.budget-bar-track { height: 6px; background: var(--color-stone-200); border-radius: 3px; }
.budget-bar-fill  { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.budget-bar-fill.ok      { background: var(--color-green-500); }    /* < 70% */
.budget-bar-fill.warning  { background: var(--color-yellow-500); }  /* 70-85% */
.budget-bar-fill.danger   { background: var(--color-orange-500); }  /* 85-100% */
.budget-bar-fill.over     { background: var(--color-red-500); }     /* > 100% */

/* Impact Preview */
.impact-preview { border-left: 4px solid var(--color-indigo-500); padding: 12px 16px; border-radius: 0 8px 8px 0; background: var(--color-stone-50); }

/* Step indicator */
.step-dot        { width: 8px; height: 8px; border-radius: 50%; background: var(--color-stone-300); }
.step-dot.active { background: var(--color-indigo-500); width: 24px; border-radius: 4px; }

/* Classification pills */
.classification-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--color-stone-200); }
.pill.active { background: var(--color-indigo-50); border-color: var(--color-indigo-500); }

/* Category chips */
.chips-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.chip { padding: 12px; border-radius: 10px; border: 1.5px solid var(--color-stone-200); text-align: center; }
.chip.active { background: var(--color-indigo-50); border-color: var(--color-indigo-500); }
```

Traduzir esses padrões para Tailwind — nunca hardcodar hex, sempre usar tokens CSS do DS.

### Componentes UI Existentes (USAR, não reinventar)

Em `src/client/components/ui/`:
- `button.tsx` — CVA, variants: default/secondary/ghost/outline/destructive/link
- `input.tsx` — Input base com cn()
- `label.tsx` — Label
- `card.tsx` — Card + CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction
- `badge.tsx` — 4 variants (default/secondary/outline/destructive)
- `currency-input.tsx` — Input monetário R$ (centavos in/out) — **usar no Step 1 do CascadeInput**
- `percentage-input.tsx` — Input percentual (basis points in/out)
- `empty-state.tsx` — Estado vazio com ícone + CTA
- `page-header.tsx` — H1 + description + action button
- `skeleton.tsx`, `dialog.tsx`, `sheet.tsx`, `select.tsx`, `tabs.tsx`, `table.tsx`, `breadcrumb.tsx`

### Helpers Existentes (USAR, não recriar)

- `@/client/utils/format-currency.ts` — `formatCurrency(cents)` → "R$ 1.234,56" — usar no BudgetProgressBar e ImpactPreview
- `@/client/utils/currency-input.ts` — `centsToDisplayValue(cents)` / `displayValueToCents(display)` — já usado pelo CurrencyInput
- `@/client/lib/utils.ts` — `cn()` — merge de classes Tailwind

### Padrão de Componente (seguir o estilo dos existentes)

Referência: `currency-input.tsx` (61 linhas) — componente controlado com useState interno para display, useEffect para sync com prop, 'use client', imports de shadcn, interface de props explícita, sem default export.

```tsx
// Padrão obrigatório:
'use client';                                    // sempre que tem hooks
import { cn } from '@/client/lib/utils';         // para merge de classes
interface XxxProps { ... }                        // interface explícita, não type
export function Xxx({ ...props }: XxxProps) {}    // named export, nunca default
```

### Convenções de Teste (seguir o padrão da Story 2.5.5)

Referência: `currency-input.test.tsx` — Vitest + React Testing Library, `describe`/`it`, `@testing-library/user-event` para interações, `vi.stubGlobal('localStorage', ...)` se precisar de localStorage.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
```

### Design System Page — Padrão de Seção

Usar o helper `<Section id="xxx" title="Xxx">` que já existe em `page.tsx`. Cada seção usa estado local (`useState`) para exemplos interativos. Ver seções CurrencyInput e PercentageInput como referência.

### O Que NÃO Fazer

- **NÃO integrar com backend** — componentes são 100% apresentacionais nesta story
- **NÃO criar stores/contexts** — state management fica no Épico 3
- **NÃO adicionar rotas/pages** — os componentes vivem apenas na DS page por enquanto
- **NÃO hardcodar hex** — sempre usar tokens Tailwind (bg-green-500, text-stone-400, etc.)
- **NÃO criar componentes da Fase 2/3** (TapToTracePanel, GoldenRuleGauge, etc.) — fora do escopo
- **NÃO implementar parcelas (installment strip)** no CascadeInput — isso é feature do Épico 5 (cartão de crédito). O Step 3 desta story cobre apenas estabelecimento + pagamento + impact preview.

### Ordem de Implementação Recomendada

1. **BudgetProgressBar** (0 dependências internas) — componente atômico mais simples
2. **SummaryCard** (0 dependências internas) — outro atômico simples
3. **ImpactPreview** (depende de BudgetProgressBar) — composto, usa mini budget bar
4. **BottomNavigation** (0 dependências internas) — componente standalone
5. **CascadeInput** (depende de CurrencyInput + ImpactPreview) — o mais complexo, por último

### Project Structure Notes

Todos os componentes vão em `src/client/components/ui/`:
```
src/client/components/ui/
├── budget-progress-bar.tsx        ← NOVO
├── budget-progress-bar.test.tsx   ← NOVO
├── summary-card.tsx               ← NOVO
├── summary-card.test.tsx          ← NOVO
├── impact-preview.tsx             ← NOVO
├── impact-preview.test.tsx        ← NOVO
├── bottom-navigation.tsx          ← NOVO
├── bottom-navigation.test.tsx     ← NOVO
├── cascade-input.tsx              ← NOVO
├── cascade-input.test.tsx         ← NOVO
├── currency-input.tsx             ← existente (usado pelo CascadeInput)
├── ...outros existentes...
```

Design System Page: `src/app/design-system/page.tsx` (adicionar seções ao final)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Custom Components] — Specs dos 14 componentes, Fase 1 lista
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Implementation Roadmap] — Ordem de prioridade por fase
- [Source: _bmad-output/prototypes/proto-07-cascade-input.html] — Protótipo visual do CascadeInput com CSS patterns
- [Source: _bmad-output/prototypes/proto-05-dashboard-desktop.html] — Dashboard desktop com SummaryCards e BottomNav
- [Source: _bmad-output/prototypes/proto-06-dashboard-mobile.html] — Dashboard mobile com BottomNavigation + FAB
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1] — Requisitos do CascadeInput + ImpactPreview
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.6] — Requisitos do BudgetProgressBar
- [Source: _bmad-output/implementation-artifacts/2-5-5-component-library-extracao-de-compostos.md] — Padrões de componente, testes e DS page da story anterior
- [Source: _bmad-output/implementation-artifacts/epic-2-retro-2026-03-24.md#Story 2.5.6] — "Sally prototipa primeiro, dev implementa. Tudo no DS antes de existir em tela."
- [Source: _bmad-output/planning-artifacts/backlog-ux-gaps-prototipos.md] — Gaps entre protótipos e implementação (contexto de onde esses componentes serão usados)
- [Source: src/client/components/ui/currency-input.tsx] — Referência de padrão de componente existente

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Testes BudgetProgressBar: 16/16 passando (4 faixas cor, 3 variantes, ARIA, edge cases)
- Testes SummaryCard: 10/10 passando (default/compact, trends, ícones, aria-label)
- Testes ImpactPreview: 12/12 passando (items, setas, budget bar, badge excede, border colors)
- Testes BottomNavigation: 10/10 passando (5 itens, aria-current, FAB, navigate, badges)
- Testes CascadeInput: 12/12 passando (steps, navegação, cancelar, confirmar, validação, categorias filtradas)
- Build: 0 erros TypeScript, 0 erros Next.js
- Suite completa: 754/755 passando (1 falha pré-existente em client.test.ts — timeout, não relacionada)

### Completion Notes List

- Implementados 5 componentes novos puramente apresentacionais para o Épico 3 (Fase 1 Core/MVP)
- BudgetProgressBar: 3 variantes (inline/expanded/mini), 4 faixas de cor semafórica, ARIA completo
- SummaryCard: 2 variantes (default/compact), suporte a trend (positive/negative/neutral), ícone Lucide opcional, usa Card shadcn como base
- ImpactPreview: mostra antes/depois com setas coloridas, integra BudgetProgressBar mini quando item tem budget, badge "Excede orçamento", border-left dinâmica por estado
- BottomNavigation: 5 itens fixos com FAB central 48px elevado, badges de notificação com max "9+", aria-current no item ativo
- CascadeInput: progressive disclosure em 4 steps com step indicator, integra CurrencyInput e ImpactPreview, categorias filtradas por classificação, validação inline
- Tipo exportado CascadeInputData disponível para uso futuro no Épico 3
- Todos os componentes seguem o padrão existente: 'use client', interface explícita, named export, cn() para classes, tokens Tailwind (nunca hex hardcoded)
- 60 novos testes (Vitest + React Testing Library) cobrindo renderização, interações, ARIA, edge cases
- 5 novas seções interativas na página /design-system com exemplos representativos
- O import path de cn() é @/client/utils/utils (não @/client/lib/utils como mencionado no Dev Notes — seguido padrão real do codebase)

### Change Log

- 2026-04-03: Implementação completa da Story 2.5.6 — 5 componentes novos (BudgetProgressBar, SummaryCard, ImpactPreview, BottomNavigation, CascadeInput), 5 arquivos de teste (60 testes), 5 novas seções no Design System

### File List

**Novos:**
- src/client/components/ui/budget-progress-bar.tsx
- src/client/components/ui/budget-progress-bar.test.tsx
- src/client/components/ui/summary-card.tsx
- src/client/components/ui/summary-card.test.tsx
- src/client/components/ui/impact-preview.tsx
- src/client/components/ui/impact-preview.test.tsx
- src/client/components/ui/bottom-navigation.tsx
- src/client/components/ui/bottom-navigation.test.tsx
- src/client/components/ui/cascade-input.tsx
- src/client/components/ui/cascade-input.test.tsx

**Modificados:**
- src/app/design-system/page.tsx (imports + 5 novas seções de componente)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status: in-progress → review)
- _bmad-output/implementation-artifacts/2-5-6-component-library-componentes-novos-epic-3.md (tasks [x], status, Dev Agent Record)
