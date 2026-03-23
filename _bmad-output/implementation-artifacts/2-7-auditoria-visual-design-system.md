# Story 2.7: Auditoria Visual — Alinhar Telas Existentes ao Design System e Protótipos

Status: ready-for-dev

## Story

As a usuário do Caderninho,
I want que todas as telas existentes sigam os mesmos padrões visuais do design system e protótipos,
so that a experiência seja consistente e profissional em todas as áreas do app.

## Contexto

As stories 2.1 (Contas Bancárias), 2.2 (Cartões de Crédito) e 2.3 (Investimentos e Receitas) foram desenvolvidas **antes** da página de design system (`/design-system`) existir. Os protótipos visuais em `_bmad-output/prototypes/` também foram criados/refinados depois. Isso significa que as telas podem ter inconsistências de tokens, espaçamento, componentes e padrões visuais.

Esta story audita e corrige essas inconsistências para que, daqui em diante, todo desenvolvimento parta de uma base visual uniforme.

## Escopo

### Telas a auditar

1. **Contas Bancárias** (`/accounts`) — `src/client/components/bank-accounts/`
2. **Cartões de Crédito** (`/credit-cards`) — `src/client/components/credit-cards/`
3. **Investimentos** (`/investments`) — `src/client/components/investments/`
4. **Fontes de Receita** (`/income-sources`) — `src/client/components/income-sources/`
5. **Categorias** (`/categories`) — `src/client/components/categories/` (Story 2.4, PR #14)
6. **Dashboard** (`/dashboard`) — `src/app/(app)/dashboard/page.tsx`
7. **Layout compartilhado** — `src/client/components/layout/` (Sidebar, BottomNavigation)
8. **Telas de Auth** (`/login`, `/register`) — `src/client/components/auth/`

### Referências obrigatórias

- **Design System**: `src/app/design-system/page.tsx` (componentes reais renderizados)
- **Protótipos**: `_bmad-output/prototypes/` (referência visual canônica)
- **Tokens CSS**: `src/app/globals.css` (`:root`, `@theme`, `@theme inline`)

## Acceptance Criteria

- [ ] AC 1: Given qualquer tela auditada, when comparar com o design system, then TODOS os tokens de cor usam variáveis CSS do `globals.css` (nunca hex hardcoded como `#DDD6FE`, `#E0E7FF`, etc.)
- [ ] AC 2: Given cards em qualquer tela, when inspecionar, then usam `rounded-[var(--radius-card)]` (12px) e não `rounded-lg` ou `rounded-xl` arbitrário
- [ ] AC 3: Given botões em qualquer tela, when inspecionar, then usam o componente `<Button>` de `@/client/components/ui/button` (nunca `<button>` nativo)
- [ ] AC 4: Given empty states em qualquer tela, when visualizar, then seguem o padrão canônico: `border border-dashed border-border rounded-[var(--radius-card)]` + texto + CTA + hint
- [ ] AC 5: Given listas colapsáveis em qualquer tela, when interagir, then seguem o padrão do design system: chevron ▼ expandido / ◀ colapsado, badge de contagem, ações no hover
- [ ] AC 6: Given inputs monetários (R$), when interagir, then seguem o padrão bancário (inputMode="numeric", vírgula automática, `centsToDisplayValue`/`displayValueToCents`)
- [ ] AC 7: Given inputs de percentual (%), when interagir, then seguem o mesmo padrão (inputMode="numeric", vírgula automática, basis points)
- [ ] AC 8: Given textos com valores monetários, when visualizar, then usam `tabular-nums` e `formatCurrency()` de `@/client/utils/utils`
- [ ] AC 9: Given a seção de loading de qualquer tela, when carregando, then exibe `Skeleton` (nunca tela em branco)
- [ ] AC 10: Given espaçamento entre elementos, when inspecionar, then usa a escala padrão do design system (4, 8, 12, 16, 20, 24, 32px)

## Tasks

### Fase 1: Auditoria (investigação)

- [ ] Task 1: Auditar `/accounts` — comparar `BankAccountForm`, `BankAccountCard`, `BankAccountList` contra design system e protótipos
  - File: `src/client/components/bank-accounts/*.tsx`
  - Action: Listar todas as inconsistências encontradas (tokens, espaçamento, componentes, padrões)

- [ ] Task 2: Auditar `/credit-cards` — comparar `CreditCardForm`, `CreditCardCard`, `CreditCardList`
  - File: `src/client/components/credit-cards/*.tsx`
  - Action: Listar inconsistências

- [ ] Task 3: Auditar `/investments` — comparar `InvestmentForm`, `InvestmentCard`, `InvestmentList`
  - File: `src/client/components/investments/*.tsx`
  - Action: Listar inconsistências

- [ ] Task 4: Auditar `/income-sources` — comparar `IncomeSourceForm`, `IncomeSourceCard`, `IncomeSourceList`
  - File: `src/client/components/income-sources/*.tsx`
  - Action: Listar inconsistências

- [ ] Task 5: Auditar `/categories` — comparar `CategoryTree`, `ClassificationSection`, `CategoryCard`, `CategoryForm`, `SubcategoryForm`, `ClassificationForm`, `ClassificationMergeDialog`
  - File: `src/client/components/categories/*.tsx`
  - Action: Listar inconsistências. Atenção especial: é a tela mais recente (PR #14) e foi marcada pelo usuário como "feiona"
  - Notes: Componentes incluem lista colapsável (classificação → categorias → subcategorias), formulários em dialog, merge dialog, empty states, badges de orçamento

- [ ] Task 6: Auditar layout compartilhado — `Sidebar`, `BottomNavigation`, `DensityProvider`
  - File: `src/client/components/layout/*.tsx`
  - Action: Listar inconsistências

- [ ] Task 7: Auditar telas de auth — `LoginForm`, `RegisterForm`
  - File: `src/client/components/auth/*.tsx`
  - Action: Listar inconsistências

- [ ] Task 8: Auditar Dashboard
  - File: `src/app/(app)/dashboard/page.tsx`
  - Action: Listar inconsistências

### Fase 2: Correções

- [ ] Task 9: Corrigir tokens de cor hardcoded → variáveis CSS semânticas (AC 1)
  - Action: Substituir hex literals por tokens (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-primary-light`, etc.)

- [ ] Task 10: Corrigir border-radius → tokens do design system (AC 2)
  - Action: Cards → `rounded-[var(--radius-card)]`, badges → `rounded-[var(--radius-badge)]`, botões → `rounded-[var(--radius-button)]`

- [ ] Task 11: Substituir `<button>` nativo por `<Button>` component (AC 3)
  - Action: Buscar todos os `<button` em componentes e trocar por `<Button>` com variant/size adequado

- [ ] Task 12: Corrigir empty states para padrão canônico (AC 4)
  - Action: Verificar se existem empty states fora do padrão e alinhar

- [ ] Task 13: Verificar e corrigir espaçamento (AC 10)
  - Action: Conferir que gaps, paddings e margins seguem a escala do design system

### Fase 3: Validação

- [ ] Task 14: Rodar build (`npx next build`) e lint para garantir que as correções não quebraram nada
- [ ] Task 15: Verificar visualmente cada tela no browser — comparar antes/depois

## Dev Notes

### O que NÃO fazer nesta story

- **Não refatorar lógica de negócio** — apenas ajustes visuais/de apresentação
- **Não adicionar funcionalidades novas** — escopo é auditoria e correção
- **Não modificar schemas, use cases ou repositories** — apenas componentes de UI
- **Não alterar testes unitários** — a menos que um teste verifique classe CSS específica que mudou

### Padrões de referência

| Padrão | Referência no Design System | Token/Componente |
|--------|---------------------------|------------------|
| Cor primária | Seção "Cores / Tokens" | `bg-primary` (#4F46E5) |
| Cor de fundo | Seção "Cores / Tokens" | `bg-background` (#FAFAF9) |
| Border padrão | Seção "Cores / Tokens" | `border-border` (#E7E5E4) |
| Card radius | Seção "Cards" | `rounded-[var(--radius-card)]` (12px) |
| Badge radius | Seção "Badges" | `rounded-[var(--radius-badge)]` (100px) |
| Botão | Seção "Botões" | `<Button variant="..." size="...">` |
| Empty state | Seção "Empty States" | `border-dashed border-border rounded-[var(--radius-card)]` |
| Input monetário | Seção "Formulários" | `inputMode="numeric"`, vírgula automática |
| Lista colapsável | Seção "Lista Colapsável" | Chevron ▼/◀, badge contagem, hover actions |
| Skeleton | Seção "Skeleton" | `<Skeleton className="h-X w-Y" />` |
| Valores monetários | Toda a app | `tabular-nums`, `formatCurrency()` |

### Utilitários existentes (NÃO reinventar)

- `src/client/utils/utils.ts` → `formatCurrency(cents)`, `cn()`
- `src/client/utils/currency-input.ts` → `centsToDisplayValue()`, `displayValueToCents()`
- `src/client/utils/percentage-input.ts` → `basisPointsToDisplayValue()`, `displayValueToBasisPoints()`
- `src/client/components/ui/*` → Todos os componentes shadcn/ui v4

### Protótipos relevantes

- `_bmad-output/prototypes/proto-01-login-signup.html` — login/register
- `_bmad-output/prototypes/proto-02-link-account.html` — contas bancárias
- `_bmad-output/prototypes/proto-12-credit-card.html` — cartões
- `_bmad-output/prototypes/proto-14-categories-ux-v2.html` — categorias e hierarquia
- `_bmad-output/prototypes/proto-15-settings.html` — configurações
- `_bmad-output/prototypes/visual-direction-B-stone-indigo.html` — paleta visual canônica

### Project Structure Notes

- Componentes de UI: `src/client/components/ui/` (shadcn/ui v4, Base UI)
- Componentes de feature: `src/client/components/{feature}/` (bank-accounts, credit-cards, etc.)
- Layout: `src/client/components/layout/` (Sidebar, BottomNavigation, DensityProvider)
- Rotas: `src/app/(app)/{feature}/page.tsx`
- Auth: `src/app/(auth)/{login,register}/page.tsx`
- Globals CSS: `src/app/globals.css` (tokens, variáveis, @theme)

### References

- [Source: src/app/design-system/page.tsx] — Design system completo com 40+ seções
- [Source: src/app/globals.css] — Tokens CSS (:root, @theme, @theme inline)
- [Source: _bmad-output/prototypes/] — Protótipos visuais HTML
- [Source: _bmad-output/implementation-artifacts/2-1-*.md] — Story 2.1 (padrões estabelecidos)
- [Source: _bmad-output/implementation-artifacts/2-2-*.md] — Story 2.2 (padrões replicados)
- [Source: _bmad-output/implementation-artifacts/2-3-*.md] — Story 2.3 (padrões estendidos)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
