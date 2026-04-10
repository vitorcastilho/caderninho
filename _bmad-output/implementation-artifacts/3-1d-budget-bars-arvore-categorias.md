# Story 3.1d: Budget Bars e Valores Monetários na Árvore de Categorias

Status: review

## Origem

Extraída da R1 code review da Story 3.1b em 2026-04-04. Findings: H1, H2, M4.

## Story

As a user,
I want to see budget progress bars and monetary values at every level of the category tree,
so that I can visually track spending against budgets directly in the categories page.

## Acceptance Criteria

1. **Given** o usuário vê uma classificação na árvore **When** ela tem categorias com budget **Then** mostra budget bar colorida com label "70% do máx — resta R$ 1.800,00" e valores totais [H1]

2. **Given** o usuário vê uma categoria na árvore **When** ela tem budget configurado **Then** mostra budget bar com 4 cores (verde ≤60%, amarelo 60-80%, laranja 80-100%, vermelho >100%) + valores "R$ 2.100,00 / R$ 3.000,00" [H1]

3. **Given** o usuário vê uma subcategoria na árvore **When** ela tem gastos **Then** mostra valores monetários "R$ 2.800,00 / R$ 2.500–3.000" com budget bar [M4]

4. **Given** o usuário vê um estabelecimento na árvore **When** ele tem gastos **Then** mostra valor gasto (ex: "R$ 1.200,00"), budget bar e percentual relativo à subcategoria (ex: "43% de Supermercado") [H2]

## Tasks / Subtasks

### Fase 0: Design System & Protótipos

- [x] Task 0: Consultar proto-14 e DS
  - [x] 0.1: Ler `_bmad-output/prototypes/proto-14-categorias.html` — seções de budget bar em cada nível
  - [x] 0.2: Verificar componente `budget-bar.tsx` no DS (se existe)
  - [x] 0.3: Consultar página `/design-system` — tokens de cores para status (positive/attention/alert/critical)

### Fase 1: Componente BudgetBar

- [x] Task 1: Criar ou reutilizar componente BudgetBar
  - [x] 1.1: Track + fill com 4 cores baseadas no percentual
  - [x] 1.2: Labels: valores gastos/total + "resta R$ X" ou "excedeu R$ X"
  - [x] 1.3: Variante compacta para subcategoria/estabelecimento

### Fase 2: Dados de gasto por nível

- [x] Task 2: Backend — agregar gastos por classificação, categoria, subcategoria, estabelecimento
  - [x] 2.1: Query ou use case que retorna gastos do mês corrente por nível
  - [x] 2.2: Passar dados para CategoryTree como prop

### Fase 3: Integrar budget bars nos componentes

- [x] Task 3: Adicionar budget bars na árvore
  - [x] 3.1: ClassificationSection — budget bar total da classificação
  - [x] 3.2: CategoryCard — budget bar da categoria
  - [x] 3.3: CategoryCard (subcategoria) — valores monetários + budget bar
  - [x] 3.4: EstablishmentRow — valor gasto + percentual relativo + budget bar

## Dev Notes

### Design System & Protótipos

**Protótipo canônico:** `_bmad-output/prototypes/proto-14-categorias.html`

- Budget bars aparecem em TODOS os 4 níveis da hierarquia
- 4 cores: verde (≤60%), amarelo (60-80%), laranja (80-100%), vermelho (>100%)
- Labels mostram valor gasto / total + "resta R$ X" ou "excedeu R$ X"
- Estabelecimento mostra percentual relativo à subcategoria pai

### Arquivos principais a modificar

- `src/client/components/categories/ClassificationSection.tsx`
- `src/client/components/categories/CategoryCard.tsx`
- `src/client/components/categories/EstablishmentRow.tsx`
- Novo componente: `src/client/components/ui/budget-bar.tsx` (ou reutilizar se existir)
- Backend: query de agregação de gastos por período/nível

### Referências

- Proto-14: `_bmad-output/prototypes/proto-14-categorias.html`
- Findings originais: Story 3.1b R1 (H1, H2, M4)

## Dev Agent Record

### Implementation Plan

1. **Task 0 — Consulta DS/Proto**: Analisou proto-14, encontrou BudgetProgressBar existente com thresholds divergentes (70/85/100 vs 60/80/100 do proto). Tokens semânticos já existiam no DS.

2. **Task 1 — BudgetProgressBar**: Atualizou componente existente:
   - Corrigiu thresholds para ≤60%/60-80%/80-100%/>100% conforme proto-14
   - Migrou de `bg-green-500` etc. para tokens semânticos (`bg-positive`, `bg-attention`, `bg-alert`, `bg-critical`)
   - Adicionou prop `showRemainder` com labels "resta R$ X" / "excedeu R$ X"
   - Atualizou 22 testes para novos thresholds

3. **Task 2 — Backend**: 
   - Adicionou `getMonthlySpendingSummary` ao TransactionRepository interface
   - Implementou no DrizzleTransactionRepository com 3 queries paralelas (by category, subcategory, establishment)
   - Criou use case `createGetMonthlySpendingSummary` com Maps para lookup eficiente
   - Criou `getEstablishmentSpendingKey` em `@/shared/utils/spending-key.ts`
   - Adicionou server action `getMonthlySpendingSummaryAction` com serialização de Maps para arrays
   - 4 testes unitários para o use case

4. **Task 3 — Integração**:
   - `page.tsx`: carrega spending data em paralelo com os demais dados
   - `CategoryTree`: recebe `initialSpending`, converte para Maps, propaga via props, recarrega no `refreshData`
   - `ClassificationSection`: calcula gasto total da classificação, mostra budget bar + "X% do máx — resta R$ Y"
   - `CategoryCard`: mostra gasto/budget na categoria + budget bar, subcategoria com % relativo ao pai
   - `EstablishmentRow`: mostra valor gasto + budget bar + "X% de [subcategoria]"

### Completion Notes

- **Decisão**: subcategories não têm campos budget no DB schema. Mostram spent + % relativo à categoria pai (conforme padrão proto-14 para itens "sem orç.")
- **Decisão**: establishment em transactions é campo texto (não FK). Matching feito por nome + subcategoryId via chave composta
- **Decisão**: Reutilizou BudgetProgressBar existente do DS (variante mini) em vez de criar componente novo — conforme workflow de enforcement
- 905 testes passando, 0 erros TS, lint limpo

### Debug Log

Nenhum bloqueio encontrado.

## File List

- `src/client/components/ui/budget-progress-bar.tsx` — modificado (thresholds, tokens semânticos, showRemainder)
- `src/client/components/ui/budget-progress-bar.test.tsx` — modificado (testes atualizados para novos thresholds)
- `src/client/components/categories/CategoryTree.tsx` — modificado (spending state, Maps, props)
- `src/client/components/categories/ClassificationSection.tsx` — modificado (budget bar + gastos na classificação)
- `src/client/components/categories/CategoryCard.tsx` — modificado (budget bar + gastos em categoria/subcategoria)
- `src/client/components/categories/EstablishmentRow.tsx` — modificado (valor gasto + % relativo)
- `src/app/(app)/categories/page.tsx` — modificado (carrega spending data)
- `src/app/design-system/page.tsx` — modificado (thresholds atualizados na documentação)
- `src/server/domain/transactions/repositories/transaction.repository.ts` — modificado (novo método getMonthlySpendingSummary)
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — modificado (implementação getMonthlySpendingSummary)
- `src/server/domain/transactions/use-cases/get-monthly-spending-summary.ts` — novo
- `src/server/domain/transactions/use-cases/get-monthly-spending-summary.test.ts` — novo
- `src/server/actions/transaction.actions.ts` — modificado (nova action getMonthlySpendingSummaryAction)
- `src/shared/utils/spending-key.ts` — novo
- `src/server/domain/transactions/use-cases/create-transaction.test.ts` — modificado (mock atualizado)
- `src/server/domain/transactions/use-cases/get-impact-preview.test.ts` — modificado (mock atualizado)
- `src/server/domain/transactions/use-cases/get-suggested-establishments.test.ts` — modificado (mock atualizado)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — modificado (status: in-progress → review)

## Change Log

- 2026-04-10: Implementação completa — budget bars e valores monetários em 4 níveis da árvore de categorias. BudgetProgressBar alinhado com proto-14 (thresholds 60/80/100, tokens semânticos). Backend com agregação de gastos mensais por categoria/subcategoria/estabelecimento. 905 testes passando.
