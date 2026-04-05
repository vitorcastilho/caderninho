# Story 3.1d: Budget Bars e Valores Monetários na Árvore de Categorias

Status: ready-for-dev

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

- [ ] Task 0: Consultar proto-14 e DS
  - [ ] 0.1: Ler `_bmad-output/prototypes/proto-14-categorias.html` — seções de budget bar em cada nível
  - [ ] 0.2: Verificar componente `budget-bar.tsx` no DS (se existe)
  - [ ] 0.3: Consultar página `/design-system` — tokens de cores para status (positive/attention/alert/critical)

### Fase 1: Componente BudgetBar

- [ ] Task 1: Criar ou reutilizar componente BudgetBar
  - [ ] 1.1: Track + fill com 4 cores baseadas no percentual
  - [ ] 1.2: Labels: valores gastos/total + "resta R$ X" ou "excedeu R$ X"
  - [ ] 1.3: Variante compacta para subcategoria/estabelecimento

### Fase 2: Dados de gasto por nível

- [ ] Task 2: Backend — agregar gastos por classificação, categoria, subcategoria, estabelecimento
  - [ ] 2.1: Query ou use case que retorna gastos do mês corrente por nível
  - [ ] 2.2: Passar dados para CategoryTree como prop

### Fase 3: Integrar budget bars nos componentes

- [ ] Task 3: Adicionar budget bars na árvore
  - [ ] 3.1: ClassificationSection — budget bar total da classificação
  - [ ] 3.2: CategoryCard — budget bar da categoria
  - [ ] 3.3: CategoryCard (subcategoria) — valores monetários + budget bar
  - [ ] 3.4: EstablishmentRow — valor gasto + percentual relativo + budget bar

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
