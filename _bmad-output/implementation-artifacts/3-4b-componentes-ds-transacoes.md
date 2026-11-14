# Story 3.4b: Componentes DS para tela de transações

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a designer/dev,
I want os 4 componentes visuais novos da tela `/transactions` extraídos para o Design System,
so that `/transactions` (Story 3.4c) e telas futuras (`/dashboard`, `/drill-down`) possam reusar a mesma linha de transação, cards de resumo e barra de filtros sem reinventar — respeitando a Barreira 4 ("componente novo = DS primeiro, nunca ad-hoc") da Story 2.5.7.

## Acceptance Criteria

1. **Given** o DS deve oferecer uma linha de transação canônica **When** o dev importa `TransactionRow` de `@/client/components/ui/transaction-row` **Then** o componente renderiza nos 3 tipos (`expense`/`income`/`transfer`) com faixa lateral colorida (vermelho/verde/azul, 3px), ícone circular (emoji p/ gasto, lucide `ArrowDownLeft` p/ receita, `ArrowLeftRight` p/ transferência), nome+categoria à esquerda, valor+método à direita (sinal `−`/`+`/sem sinal, `tabular-nums`), e botão `MoreVertical` com `stopPropagation` independente do `onClick` da linha.

2. **Given** transferência tem 2 endpoints **When** `type='transfer'` e `transferEndpoints={ source, destination }` **Then** o conteúdo central renderiza `BankLogo` + nome do banco origem → `BankLogo` + nome do banco destino, com nomes ocultos abaixo de 380px (breakpoint `xs`) e `secondary` (label "Transferência") embaixo.

3. **Given** o DS deve oferecer cards de resumo do período **When** o dev importa `TransactionSummaryCards` de `@/client/components/ui/transaction-summary-cards` **Then** renderiza 3 cards lado a lado (`grid-cols-3`) — Saídas (`TrendingDown`, label `text-negative`, valor `text-foreground`), Entradas (`TrendingUp`, label `text-positive-text`, valor `text-positive-text`), Transferências (`ArrowLeftRight`, label `text-info-text`, valor `text-muted-foreground`) — cada um com `totalCents` formatado e `count` de transações **And** em mobile (< 768px) usa variante compacta (padding/fonte reduzidos, labels abreviados "Saídas"/"Entradas"/"Transf.", count "12 trans.").

4. **Given** o DS deve oferecer uma barra de filtros **When** o dev importa `TransactionFiltersBar` de `@/client/components/ui/transaction-filters-bar` **Then** renderiza linha única com (a) busca expansível (`flex-1`, ícone `Search`, controlada via `value`/`onSearchChange`), (b) segmented control de tipo (Tudo/Saídas/Entradas/Transferências, ativo `bg-primary text-white`, em mobile usa labels abreviados quando definidos), (c) pílula clicável de mês (ícone `Calendar` + label formatado + `ChevronDown`, dispara `onMonthClick: () => void` — consumer decide popover/toggle/select externo), (d) botão "Filtros" com badge de `activeFiltersCount` (visual destaca quando count > 0 — `border-primary bg-primary-light text-primary`).

5. **Given** o DS deve oferecer um side sheet de filtros avançados **When** o dev importa `TransactionFiltersSheet` de `@/client/components/ui/transaction-filters-sheet` **Then** abre/fecha controlado via `open`/`onOpenChange`, lista categorias (com emoji) e métodos de pagamento (`BankLogo` + label) com `Checkbox` para multi-seleção, mantém **estado local** (cópia da seleção) que só é commitada via `onApply`, fechar sem aplicar **descarta** mudanças, botão "Limpar" zera apenas a seleção interna do sheet (não mexe em tipo/mês/busca externos), em mobile ocupa 100% da largura.

6. **Given** o DS é a referência visual canônica **When** o dev acessa `/design-system` **Then** vê 3 novas seções (ou 1 expandida substituindo `ListaTransacoesSection` em `src/app/design-system/page.tsx:1829`) que renderizam os 4 componentes reais importados de `@/client/components/ui/`, mostram variantes desktop e mobile, e exibem snippets copy-paste-friendly **And** `ListaTransacoesSection` ad-hoc anterior é removida ou substituída por `TransactionRowSection`.

7. **Given** os componentes precisam de novos tokens visuais **When** `src/app/globals.css` é lido **Then** contém `--color-negative: #DC2626` (gera utilities `text-negative`, `border-l-negative`) **And** contém o breakpoint `--breakpoint-xs: 380px` em `@theme {}` (gera utility `xs:inline`).

8. **Given** `TransactionRow` precisa do emoji da categoria para o ícone **When** o consumer chama `listCategoriesAction()` (`src/server/actions/category.actions.ts`) **Then** o DTO retornado expõe `emoji: string` (já existe na entity e no schema — só validar/expor) **And** a interface `CategoryOption` consumida em `TransactionList.tsx` é estendida com `emoji?: string` (mudança não-quebrante).

9. **Given** os componentes são reutilizáveis e isolados **When** os testes unitários rodam **Then** cada um dos 4 componentes tem cobertura mínima de render por variante, comportamento de callbacks (`onClick`/`onAction`/`onApply`/`onClear`), e estados (loading/empty para cards) **And** `npx tsc --noEmit` passa com 0 erros, `npx eslint src --max-warnings=0` passa com 0 warnings, `npx vitest run` passa 100%.

10. **Given** esta story é só de DS e backend mínimo **When** o smoke test manual em `/design-system` é feito **Then** as 3 novas seções renderizam sem erros, todos os tipos/variantes aparecem corretamente, mobile mostra variantes compactas — **e** `/transactions` continua funcionando como hoje (Story 3.4 — sem regressão, já que esta story não toca em `TransactionList.tsx`).

## Tasks / Subtasks

### Fase 0: Design System & Protótipos (Obrigatória para stories com UI)

- [x] Task 0: Consultar Design System e protótipos relevantes
  - [x] 0.1: Ler protótipo canônico `_bmad-output/prototypes/proto-18-tela-transacoes.html` — versão visual de referência dos 4 componentes
  - [x] 0.2: Ler spec completa `_bmad-output/prototypes/proto-18-tela-transacoes-spec.md` — fonte canônica de props, layout, tokens, comportamento (esta story implementa as **seções 2, 3, 4, 5, 8** da spec)
  - [x] 0.3: Estudar evolução nos estudos: `_bmad-output/prototypes/study-3-4-linha-transacao-evolucao.html` (5 propostas → versão G escolhida) e `_bmad-output/prototypes/study-3-4-filtros-evolucao.html` (3 abordagens → 3 escolhida)
  - [x] 0.4: Consultar `src/app/design-system/page.tsx` — seções `ListaTransacoesSection` (linha ~1829, será substituída), `ChipsSection` (~4054), `SeletorMesSection` (~1724), `ControleSegmentadoSection` (~1772) — para entender o padrão visual e tokens já estabelecidos
  - [x] 0.5: Listar componentes UI existentes a reutilizar (NÃO duplicar):
    - `src/client/components/ui/bank-logo.tsx` — logo de banco no `TransactionRow` transferência e no `TransactionFiltersSheet`
    - `src/client/components/ui/credit-card-brand-badge.tsx` — bandeira de cartão no `TransactionFiltersSheet`
    - `src/client/components/ui/sheet.tsx` — base do `TransactionFiltersSheet` (mesmo padrão de `EditExpenseSheet`)
    - `src/client/components/ui/dialog.tsx` — não usado nesta story, mas referência de estrutura
    - `src/client/components/ui/button.tsx` — botões "Limpar"/"Aplicar" do sheet
    - `src/client/components/ui/badge.tsx` — badge de count no botão "Filtros"
    - `src/client/components/ui/skeleton.tsx` — loading state dos cards de resumo
    - `src/client/components/ui/select.tsx` — para dropdown opcional de mês (alternativa: popover inline)
    - `src/client/components/ui/input.tsx` — base do input de busca dentro do `TransactionFiltersBar` (ou input nativo estilizado, decidir)
    - `lucide-react` icons: `MoreVertical`, `ArrowDownLeft`, `ArrowLeftRight`, `Search`, `Calendar`, `ChevronDown`, `SlidersHorizontal`, `TrendingDown`, `TrendingUp`, `X` (chip remove)
  - [x] 0.6: **NÃO criar componentes auxiliares novos sem necessidade real** — `Chip` já é citado na spec (4.5) como possivelmente existente; verificar antes de criar. Se chip não existir, criar como **subcomponente interno** do `TransactionFiltersBar` (ou utility), não como novo componente DS.

### Fase 1: Tokens e breakpoint (`globals.css`)

- [x] Task 1 (AC: #7): Adicionar tokens `--color-negative` e breakpoint `--breakpoint-xs` em `src/app/globals.css`
  - [x] 1.1: Em `@theme inline {}` ou `@theme {}` (verificar bloco apropriado), adicionar `--color-negative: #DC2626` e suas derivadas se necessário (`--color-negative-bg` opcional)
  - [x] 1.2: Adicionar `--breakpoint-xs: 380px` em `@theme {}` (Tailwind v4 — gera utilities `xs:*`)
  - [x] 1.3: Verificar que as utilities `text-negative`, `border-l-negative`, `bg-negative` (se necessárias) e `xs:inline` ficam disponíveis após `npm run dev`/`tsc`. Se a build falhar, voltar e ajustar nomenclatura.
  - [x] 1.4: **NÃO** trocar tokens existentes (`--color-positive`, `--color-info-text`, `--radius-card`, etc) — só adicionar.

### Fase 2: Backend mínimo — DTO de categoria com emoji

- [x] Task 2 (AC: #8): Garantir `emoji` no DTO de `listCategoriesAction`
  - [x] 2.1: Inspecionar `src/server/actions/category.actions.ts:100` (`listCategoriesAction`) e `src/server/domain/categories/use-cases/list-categories.ts` — confirmar se o retorno já carrega `emoji` (campo existe em `src/server/infrastructure/database/schema/categories.ts:10` com default `'📁'`).
  - [x] 2.2: Se já vem: nenhuma mudança no backend. Apenas validar que o `Category` type (em `src/server/domain/categories/entities/...`) inclui `emoji: string`.
  - [x] 2.3: Se NÃO vem (provavelmente vem, pois é `notNull` no schema): adicionar mapeamento no use case ou repository para incluir `emoji`.
  - [x] 2.4: Se houver schema de output Zod, garantir que inclui `emoji: z.string()`.
  - [x] 2.5: **NÃO** alterar a interface `CategoryOption` em `TransactionList.tsx` nesta story — isso é parte da Story 3.4c (consumer). Esta story só garante que o backend expõe.
  - [x] 2.6: Adicionar/atualizar teste em `category.actions.test.ts` confirmando que `emoji` está presente no DTO se a cobertura existir; senão, deixar como já está.

### Fase 3: Componente `TransactionRow`

- [x] Task 3 (AC: #1, #2): Criar `src/client/components/ui/transaction-row.tsx`
  - [x] 3.1: Implementar interface `TransactionRowProps` exportada conforme spec seção 2.1:
    ```ts
    export type TransactionRowType = 'expense' | 'income' | 'transfer';
    export interface TransactionRowProps {
      type: TransactionRowType;
      primary?: string;
      secondary: string;
      amountCents: number;
      method?: string;
      icon:
        | { kind: 'emoji'; value: string }
        | { kind: 'letter'; value: string }
        | { kind: 'lucide'; name: 'ArrowDownLeft' | 'ArrowLeftRight' };
      transferEndpoints?: {
        source: { bank: string };
        destination: { bank: string };
      };
      onClick?: () => void;
      onAction?: () => void;
      actionLabel?: string;
    }
    ```
  - [x] 3.2: Layout 3 colunas + faixa lateral conforme spec 2.2 — `<li>` com `border-l-[3px]` colorido por tipo, `pl-[13px]` (compensa os 3px), `pr-4`, `gap-3`. Hover: `bg-muted/30`. Cursor: `pointer`. Atributo `data-type={type}` para testes/CSS.
  - [x] 3.3: Faixa lateral por tipo (spec 2.3):
    - `expense` → `border-l-negative` (depende do token da Task 1)
    - `income` → `border-l-positive` (já existe)
    - `transfer` → `border-l-info` (já existe)
    - **Fallback se token não estiver pronto:** usar `style={{ borderLeftColor: '#DC2626' }}` para expense, mas Task 1 deve ser feita antes.
  - [x] 3.4: Ícone circular (spec 2.4) — `size-9 rounded-full flex items-center justify-center` com bg/fg condicionais por tipo. Renderizar conforme `icon.kind`:
    - `emoji` → `<span className="text-base leading-none">{icon.value}</span>`
    - `letter` → `<span className="text-sm font-semibold">{icon.value}</span>` (uppercase já vem da prop, decisão do consumer)
    - `lucide` → renderizar o ícone Lucide pelo nome (`ArrowDownLeft`/`ArrowLeftRight`) com `size-4`
  - [x] 3.5: Conteúdo principal (spec 2.5) — para `expense`/`income`: `primary` em bold (`text-sm font-semibold`) + `secondary` muted (`text-xs text-muted-foreground`); para `transfer`: usar `transferEndpoints` com `BankLogo size="sm"` + nome (`hidden xs:inline` para os nomes dos bancos), seta "→" no meio, `secondary` embaixo.
  - [x] 3.6: Coluna direita (spec 2.6) — valor com sinal (`expense='−'`, `income='+'`, `transfer=''`), cor por tipo (`expense='text-foreground'`, `income='text-positive-text'`, `transfer='text-muted-foreground'`), `text-sm font-semibold tabular-nums`. `method` opcional embaixo (`text-[11px] text-muted-foreground mt-0.5`).
  - [x] 3.7: Botão de ação (spec 2.7) — `<button>` com `size-7 rounded-md`, ícone `MoreVertical size-4`, `aria-label={actionLabel ?? 'Mais opções'}`, hover `bg-muted text-foreground`, `onClick={(e) => { e.stopPropagation(); onAction?.(); }}` — **CRÍTICO** que `stopPropagation` funcione para não disparar `onClick` da linha.
  - [x] 3.8: Helper `formatCurrency(amountCents)` — usar utilitário existente (`src/shared/utils/format-currency.ts` ou equivalente) ou inline com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`. Verificar se já existe — provavelmente sim (3.4 usa).
  - [x] 3.9: Criar `src/client/components/ui/transaction-row.test.tsx` cobrindo:
    - Render dos 3 tipos com props mínimas
    - Cada `icon.kind` (emoji/letter/lucide) renderiza conteúdo correto
    - Faixa lateral aparece com `data-type` correto
    - `onClick` dispara ao clicar na linha
    - `onAction` dispara ao clicar no botão MoreVertical **sem disparar `onClick`** (testar `stopPropagation`)
    - Transferência renderiza `BankLogo` x2 e nomes dos bancos (visíveis quando width >= 380px no JSDOM, ou usar `screen.getAllByText` para o texto)
    - Valor formatado com sinal correto por tipo

### Fase 4: Componente `TransactionSummaryCards`

- [x] Task 4 (AC: #3): Criar `src/client/components/ui/transaction-summary-cards.tsx`
  - [x] 4.1: Implementar props (spec seção 3.1):
    ```ts
    export interface TransactionSummaryCardsProps {
      expense: { totalCents: number; count: number };
      income: { totalCents: number; count: number };
      transfer: { totalCents: number; count: number };
      isLoading?: boolean;
    }
    ```
  - [x] 4.2: Layout responsivo (spec 3.2): grid `grid-cols-3 gap-3` em desktop, `grid-cols-3 gap-2` em mobile. Cada card é um item.
  - [x] 4.3: Estrutura por card (spec 3.3): `rounded-[10px] border border-border bg-card p-4` com label uppercase tracking-wider + ícone + valor + count. Cores conforme tabela 3.3.
  - [x] 4.4: Variante mobile (spec 3.4) — usar classes responsivas Tailwind (`md:p-4 p-2.5`, `md:text-xl text-sm`, etc) em vez de `useMediaQuery` para evitar SSR mismatches. Labels condicionais via `md:inline hidden` / `md:hidden inline`.
  - [x] 4.5: Estados (spec 3.5):
    - `isLoading=true` → renderizar `Skeleton` (de `src/client/components/ui/skeleton.tsx`) com a mesma estrutura (3 cards skeleton)
    - Sem dados (`totalCents=0`, `count=0`) → ainda renderiza o card com "R$ 0,00" e "0 transações" — NÃO esconder
  - [x] 4.6: Criar `src/client/components/ui/transaction-summary-cards.test.tsx`:
    - Render dos 3 cards com totais e counts corretos
    - Cores das labels e valores aplicadas (verificar via `data-testid` ou className)
    - Variante loading mostra skeletons
    - Counts singular/plural ("1 transação" vs "2 transações") — se decidir pluralizar; senão sempre "X transações" plural fixo (decidir na implementação e documentar)

### Fase 5: Componente `TransactionFiltersBar`

- [x] Task 5 (AC: #4): Criar `src/client/components/ui/transaction-filters-bar.tsx`
  - [x] 5.1: Implementar tipos e props (spec seção 4.1):
    ```ts
    export type TransactionTypeFilter = 'all' | 'expense' | 'income' | 'transfer';
    export type MonthFilter = { year: number; month: number } | 'all';
    export interface TransactionFiltersBarProps {
      search: string;
      type: TransactionTypeFilter;
      month: MonthFilter;
      activeFiltersCount: number;
      onSearchChange: (value: string) => void;
      onTypeChange: (type: TransactionTypeFilter) => void;
      onMonthClick: () => void;
      onOpenAdvancedFilters: () => void;
      searchPlaceholder?: string;
    }
    ```
  - [x] 5.2: Layout (spec 4.2) — `<div className="flex gap-2 items-center flex-wrap">` com 4 sub-blocos: busca (`flex-1`), segmented control de tipo (`shrink-0`), pílula de mês (`shrink-0`), botão "Filtros" com badge (`shrink-0`).
  - [x] 5.3: Busca — input controlado, ícone `Search` à esquerda, placeholder "Buscar por nome, valor ou data", `flex-1 bg-transparent text-sm outline-none`. Container `rounded-lg border border-border bg-card px-3 py-2`.
  - [x] 5.4: Segmented control de tipo — array `TYPE_OPTIONS` (constante interna) com ids/labels/mobileLabels. Renderizar 4 botões em container `inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-card p-[3px]`. Ativo: `bg-primary text-white`. Inativo: `text-muted-foreground hover:text-foreground`. Em mobile (`md:hidden`/`md:inline`) trocar label "Transferências" por "Transf.".
  - [x] 5.5: Pílula de mês — `<button>` que dispara `onMonthClick` (sem payload; consumer decide se abre popover externo, select nativo, ou cycle). Helper interno `formatMonthLabel(month)`:
    - `month === 'all'` → "Todos os meses" ou "Tudo"
    - `{ year, month }` → formatar `MMM yyyy` em pt-BR via `Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })`
  - [x] 5.6: Botão "Filtros" — abre o sheet (chama `onOpenAdvancedFilters`), badge condicional quando `activeFiltersCount > 0`. Visual destaca com `border-primary bg-primary-light text-primary` quando ativo, `border-border bg-card` quando neutro.
  - [x] 5.7: Variante mobile (spec 4.3) — usar classes responsivas Tailwind para esconder/mostrar labels e ajustar gaps. Decidir se a linha quebra em duas em mobile (`flex-wrap` já cobre).
  - [x] 5.8: Criar `src/client/components/ui/transaction-filters-bar.test.tsx`:
    - Render com busca vazia, type 'all', month 'all', count 0
    - `onSearchChange` dispara ao digitar
    - `onTypeChange` dispara ao clicar em cada opção do segmented
    - `onMonthClick` dispara ao clicar na pílula (callback sem payload — consumer é responsável pelo seletor externo)
    - Botão "Filtros" mostra badge quando `activeFiltersCount > 0` e dispara `onOpenAdvancedFilters` ao clicar
    - Badge não aparece quando count = 0
  - [x] 5.9: **Decisão sobre pílula de mês:** implementar como botão que dispara `onMonthClick` (sem payload — consumer controla popover/select de seleção). Documentar que o consumer pode envolver com seu próprio `Popover`/`<select>` invisível. **NÃO** embutir popover dentro do componente nesta versão para manter simplicidade.

### Fase 6: Componente `TransactionFiltersSheet`

- [x] Task 6 (AC: #5): Criar `src/client/components/ui/transaction-filters-sheet.tsx`
  - [x] 6.1: Implementar props (spec seção 5.1) — categorias, paymentMethods, selecteds (Set), onApply, open/onOpenChange. (Nota: `onClear` mencionado na spec foi omitido — ver Task 6.7 para a decisão; "Limpar" é totalmente interno.)
  - [x] 6.2: Estrutura (spec 5.2) — usar `Sheet` + `SheetContent side="right"` (verificar API atual de `src/client/components/ui/sheet.tsx`), `w-full sm:max-w-[360px] p-6 flex flex-col`. Header "Filtros".
  - [x] 6.3: Estado interno (spec 5.3 — CRÍTICO) — usar `useState` com cópia da seleção inicial (`new Set(selectedCategoryIds)`). Toggle local atualiza essa cópia. **Reset** sincroniza com props quando `open` muda de false → true (`useEffect`):
    ```ts
    useEffect(() => {
      if (open) {
        setLocalCategoryIds(new Set(selectedCategoryIds));
        setLocalPaymentMethodIds(new Set(selectedPaymentMethodIds));
      }
    }, [open]);
    ```
  - [x] 6.4: Lista de categorias — iterar `categories` com `<label>` clicável + `Checkbox` (verificar componente existente — se não tiver `Checkbox` no DS, usar `<input type="checkbox">` estilizado com tokens). Mostrar emoji se presente.
  - [x] 6.5: Lista de métodos de pagamento — iterar `paymentMethods` com `BankLogo` (se `bankName`) ou `CreditCardBrandBadge` (se `cardBrand`).
  - [x] 6.6: Footer — botões "Limpar" (`onClick={() => { setLocalCategoryIds(new Set()); setLocalPaymentMethodIds(new Set()); }}`) e "Aplicar" (`onClick={() => onApply({ categoryIds: localCategoryIds, paymentMethodIds: localPaymentMethodIds })`}). **Limpar** zera só a seleção local — NÃO chama `onClear` automaticamente. **Aplicar** dispara o callback com os Sets atuais.
  - [x] 6.7: **Decisão importante sobre `onClear`:** a prop `onClear` da spec é redundante se "Limpar" é interno. Reinterpretar: **`onClear` não é necessário** — o consumer recebe a seleção vazia via `onApply` quando o usuário clica Limpar+Aplicar. Documentar essa simplificação ou manter `onClear` como callback opcional para o caso "Limpar e fechar imediatamente" (decidir e documentar).
  - [x] 6.8: Mobile — `w-full` (já está) + remover `sm:max-w-[360px]` em < sm — ou seja, em mobile ocupa tela cheia.
  - [x] 6.9: Criar `src/client/components/ui/transaction-filters-sheet.test.tsx`:
    - Abre/fecha via `open`/`onOpenChange`
    - Marcar categoria atualiza estado local mas NÃO chama `onApply` (importantíssimo)
    - Clicar Aplicar chama `onApply` com a seleção local
    - Fechar sheet sem aplicar e reabrir mostra a seleção original (state reset via useEffect)
    - Limpar zera a seleção local mas NÃO commita
    - Render de categorias e paymentMethods iterando arrays de mock

### Fase 7: Atualização do `/design-system`

- [x] Task 7 (AC: #6): Atualizar `src/app/design-system/page.tsx` com as 3 novas seções
  - [x] 7.1: Substituir `ListaTransacoesSection` (linha ~1829) por `TransactionRowSection` que importa e renderiza `TransactionRow` real com:
    - 3 instâncias (uma de cada tipo) com props realistas (gasto com emoji, gasto com letter, receita, transferência)
    - Snippet de código copy-paste (em `<pre>` ou similar, seguindo o padrão das outras seções)
    - Notas de anatomia/tokens
  - [x] 7.2: Adicionar nova seção `TransactionSummaryCardsSection` (próximo a outras seções de "cards"):
    - Variante desktop e mobile lado a lado (ou uma abaixo da outra com label)
    - Snippet de uso
  - [x] 7.3: Adicionar nova seção `TransactionFiltersSection` (substituindo ou ampliando `ChipsSection` se fizer sentido — ou seção separada):
    - Renderizar `TransactionFiltersBar` com state local (useState dentro da seção) mostrando interatividade
    - Botão que abre o `TransactionFiltersSheet` para demonstrar
    - Snippet de uso
  - [x] 7.4: Manter padrão visual consistente com outras seções (header, descrição, demo, snippet).
  - [x] 7.5: Atualizar índice no topo da página (se houver) com as 3 novas entradas.
  - [x] 7.6: **NÃO** apagar `ChipsSection`, `SeletorMesSection`, `ControleSegmentadoSection` — esses padrões continuam válidos para outros usos. Só substituir `ListaTransacoesSection`.

### Fase 8: Validação

- [x] Task 8 (AC: #9, #10): Validações finais
  - [x] 8.1: `npx tsc --noEmit` — 0 erros
  - [x] 8.2: `npx eslint src --max-warnings=0` — 0 warnings
  - [x] 8.3: `npx vitest run` — todos os testes passando, **sem regressão** (Story 3.4 testes devem continuar passando — esta story não toca em `TransactionList.tsx`)
  - [x] 8.4: `npx next build` — build limpa, rotas `/design-system` e `/transactions` compilam
  - [x] 8.5: **Smoke test manual em `/design-system`** (OBRIGATÓRIO):
    - Renderiza sem erros
    - 3 novas seções aparecem
    - `TransactionRow` mostra todos os 3 tipos com cores corretas, ícone correto, sinal correto, faixa lateral correta
    - `TransactionRow` em transferência mostra `BankLogo` x2 e os nomes dos bancos
    - `TransactionRow` botão MoreVertical NÃO dispara `onClick` da linha (testar com console.log temporário ou alert)
    - `TransactionSummaryCards` mostra 3 cards com cores corretas; resize para mobile mostra variante compacta
    - `TransactionFiltersBar` segmented muda visualmente; pílula de mês formata em pt-BR; botão "Filtros" mostra badge
    - `TransactionFiltersSheet` abre, marca/desmarca, fecha sem aplicar e reabre preserva estado original, "Aplicar" commita, em mobile ocupa 100%
    - **Smoke test manual em `/transactions`** — confirmar que a tela continua funcionando exatamente como hoje (Story 3.4) — sem regressão visual ou comportamental
  - [x] 8.6: Commit + push + PR conforme MEMORY.md (`epic-3/3-4b-componentes-ds-transacoes`).

### Fase 9: Review Follow-ups (AI)

<!-- Code review rodado em 2026-04-16. Sem HIGH/MEDIUM. LOWs abaixo → backlog, não-blocking. Doc stales #1, #2, #5 corrigidos nesta rodada. -->

- [x] [AI-Review][LOW] ~~Resolvido na code review R1 da Story 3.4c (2026-11-14): área principal virou `<button>` nativo.~~ Adicionar suporte a teclado em `TransactionRow` — `role="button"`, `tabIndex` e `onKeyDown` (Enter/Space) quando `onClick` presente. Alinhado hoje com padrão existente de `TransactionListRow` (3.4), mas DS canônico deveria subir o bar. [`src/client/components/ui/transaction-row.tsx:87-96`]
- [ ] [AI-Review][LOW] Converter `TransactionRowProps` em discriminated union para garantir que `type='transfer'` exige `transferEndpoints` (e `expense`/`income` exigem `primary`) em tempo de compilação. [`src/client/components/ui/transaction-row.tsx:16-30`]
- [ ] [AI-Review][LOW] Remover `aria-label` dos `<input type="checkbox">` dentro de `<label>` em `TransactionFiltersSheet` — a `<label>` envolvente já provê nome acessível com emoji+nome. [`src/client/components/ui/transaction-filters-sheet.tsx:127-137`, `:170-180`]

## Dev Notes

### Design System & Protótipos

**Protótipos relevantes:**
- `_bmad-output/prototypes/proto-18-tela-transacoes.html` — protótipo canônico da tela completa, fonte visual de verdade para todos os componentes desta story
- `_bmad-output/prototypes/proto-18-tela-transacoes-spec.md` — **spec canônica** desta story (seções 2, 3, 4, 5, 6, 8 mapeiam diretamente para Tasks 3-7)
- `_bmad-output/prototypes/study-3-4-linha-transacao-evolucao.html` — histórico de iteração da linha (5 propostas → versão G consensuada)
- `_bmad-output/prototypes/study-3-4-filtros-evolucao.html` — histórico de iteração dos filtros (3 abordagens → versão 3 consensuada)

**Seções do DS a consultar (`src/app/design-system/page.tsx`):**
- `ListaTransacoesSection` (~1829) — **será substituída** por `TransactionRowSection`
- `ChipsSection` (~4054) — referência de padrão chip multi-seleção (usado dentro do consumer da 3.4c, não desta story)
- `SeletorMesSection` (~1724) — referência de padrão de seletor de mês (a pílula do `TransactionFiltersBar` é uma evolução desse padrão)
- `ControleSegmentadoSection` (~1772) — referência de segmented control (o segmented do `TransactionFiltersBar` herda desse padrão)
- Tokens de cor (já existem): `--color-positive: #22C55E`, `--color-positive-bg: #DCFCE7`, `--color-positive-text: #166534`, `--color-info-bg: #DBEAFE`, `--color-info-text` (ver `globals.css`)
- Tokens novos a criar (Task 1): `--color-negative: #DC2626`, `--breakpoint-xs: 380px`
- Tipografia: Inter para texto, `tabular-nums` em todos os valores monetários
- Espaçamento: grid base 4px

**Componentes UI existentes a reutilizar:**
- `src/client/components/ui/bank-logo.tsx` — usado dentro de `TransactionRow` (transferência) e `TransactionFiltersSheet` (lista de métodos)
- `src/client/components/ui/credit-card-brand-badge.tsx` — usado dentro do `TransactionFiltersSheet`
- `src/client/components/ui/sheet.tsx` — base do `TransactionFiltersSheet` (mesmo padrão de `EditExpenseSheet`)
- `src/client/components/ui/button.tsx` — botões "Limpar"/"Aplicar" do sheet
- `src/client/components/ui/badge.tsx` — pode servir de base ao badge de count no botão "Filtros" (ou implementar inline)
- `src/client/components/ui/skeleton.tsx` — loading state dos cards
- `src/client/components/ui/input.tsx` — referência (input de busca do FiltersBar pode usar input nativo estilizado)

**Regras visuais obrigatórias:**
- NÃO hardcodar hex (exceto fallback temporário para `#DC2626` se Task 1 não estiver pronta)
- NÃO criar componentes UI auxiliares novos sem necessidade real (`Chip` interno é OK; novos componentes em `ui/` exigem aval)
- Usar `tabular-nums` em todos os valores monetários
- Border-radius segue tokens (`--radius-card: 12px`, `--radius-card-inner: 8px`)
- Componente novo necessário? Esta story já é o workflow formal: dev identifica → UX prototipa (proto-18) → DS implementa (esta story) → consumer importa (Story 3.4c)

### Decisões Técnicas

**Escopo da story (o que está dentro vs fora):**
- DENTRO: 4 componentes UI novos + tokens CSS + entrada no `/design-system` + ajuste mínimo no DTO de categoria para expor `emoji`
- FORA: refatoração do `TransactionList.tsx`, novo use case backend para summary, action `getTransactionPeriodSummary`, deleção de componentes ad-hoc — tudo isso é Story **3.4c**
- Esta separação preserva a Barreira 4 (DS primeiro) e permite revisão visual cedo, antes do consumer mudar.

**Por que `TransactionFiltersBar` NÃO controla o popover de mês internamente:**
- Manter o componente "burro" (controlado) facilita testes e permite ao consumer escolher entre `<Popover>`, `<select>` nativo ou outro padrão. A pílula só dispara `onMonthChange` ou (alternativa) `onMonthClick` que o consumer captura.
- A spec deixa essa decisão em aberto na seção 4.2 (linha "abrir popover de mês"). Implementar como **callback** é o caminho mais flexível.

**`Checkbox` no `TransactionFiltersSheet`:**
- Verificar se `src/client/components/ui/checkbox.tsx` existe. Se NÃO, usar `<input type="checkbox" className="..." />` estilizado com tokens — NÃO criar `Checkbox` ad-hoc nesta story (escopo é só os 4 componentes da spec).
- Se a falta de `Checkbox` virar bloqueador, escalar como decisão e ou (a) criar `Checkbox` em paralelo seguindo workflow DS, ou (b) usar input nativo estilizado.

**Estado local do `TransactionFiltersSheet` — por que é importante:**
- O usuário pode marcar/desmarcar várias opções e mudar de ideia. Aplicar imediatamente cada toggle (re-fetching no consumer) seria caro e UX-ruim. O padrão "draft → commit no Aplicar" alinha com tela de filtros de apps modernos (e-commerce, finanças).
- Cancelar (fechar sheet sem aplicar) **descarta** as mudanças. Reabrir o sheet mostra a seleção atualmente ativa (vinda das props).

**Reset do estado local quando o sheet abre:**
- `useEffect(() => { if (open) { setLocal...(new Set(props...)); } }, [open])` — sincroniza ao abrir, ignora updates enquanto fechado. Evita state stale.

**Tokens novos vs hardcode:**
- `--color-negative: #DC2626` é a única cor "vermelha" do design — há ocasiões em todo o app (cancelar, deletar, valor negativo). Adicionar como token é correto.
- `--breakpoint-xs: 380px` cobre celulares pequenos onde o conteúdo de transferência precisa colapsar. Tailwind v4 expõe via `xs:*`.

**`emoji` na categoria:**
- O campo já existe e tem default no schema (`'📁'`). A `listCategoriesAction` provavelmente já retorna o objeto inteiro. Esta story só **valida** que vem e (se necessário) adiciona um teste — sem mudar lógica de domínio.

### Padrões de código a seguir (referências)

- **Componente UI controlado:** ver `src/client/components/ui/cascade-input.tsx` ou `src/client/components/ui/currency-input.tsx` — padrão de props (`value`/`onChange`), exports nomeados, tests adjacentes
- **Componente com Sheet:** ver `src/client/components/transactions/EditExpenseSheet.tsx` — uso correto de `Sheet`, `SheetContent`, `SheetHeader`, `SheetFooter` da `ui/sheet.tsx`
- **Tokens em globals.css:** ver `src/app/globals.css` linhas 65-100 — padrão `@theme {}` (Tailwind v4)
- **Sincronização prop→state via useEffect:** lição BankAccountList da 3.2 — `useEffect(() => setX(initial), [initial])` — relevante para o state reset do sheet
- **Iteração tipo-safe sobre `Set<string>`:** `Array.from(set).map(...)` para render

### Arquivos novos a criar

- `src/client/components/ui/transaction-row.tsx`
- `src/client/components/ui/transaction-row.test.tsx`
- `src/client/components/ui/transaction-summary-cards.tsx`
- `src/client/components/ui/transaction-summary-cards.test.tsx`
- `src/client/components/ui/transaction-filters-bar.tsx`
- `src/client/components/ui/transaction-filters-bar.test.tsx`
- `src/client/components/ui/transaction-filters-sheet.tsx`
- `src/client/components/ui/transaction-filters-sheet.test.tsx`

### Arquivos existentes a modificar

- `src/app/globals.css` — adicionar `--color-negative`, `--breakpoint-xs`
- `src/app/design-system/page.tsx` — substituir `ListaTransacoesSection` por `TransactionRowSection` + adicionar `TransactionSummaryCardsSection` + `TransactionFiltersSection`
- `src/server/actions/category.actions.ts` (provavelmente sem mudança) — apenas validar que `emoji` é exposto no `listCategoriesAction`
- `src/server/actions/category.actions.test.ts` (opcional) — teste validando emoji no DTO

### Arquivos NÃO tocados (escopo da Story 3.4c)

- `src/client/components/transactions/TransactionList.tsx`
- `src/client/components/transactions/TransactionListRow.tsx` (será deletado em 3.4c)
- `src/client/components/transactions/TransactionListFilters.tsx` (será deletado em 3.4c)
- `src/client/components/transactions/TransactionListFilters.test.tsx` (será deletado em 3.4c)
- `src/server/domain/transactions/use-cases/get-transaction-period-summary.ts` (criado em 3.4c)
- `src/server/domain/transactions/repositories/transaction.repository.ts` (modificado em 3.4c)
- `src/server/actions/transaction.actions.ts` (modificado em 3.4c)
- `src/app/(app)/transactions/page.tsx` (modificado em 3.4c)

### Dependências (NÃO instalar nada novo)

- `lucide-react` — todos os ícones necessários já existem (`MoreVertical`, `ArrowDownLeft`, `ArrowLeftRight`, `Search`, `Calendar`, `ChevronDown`, `SlidersHorizontal`, `TrendingDown`, `TrendingUp`)
- `@base-ui/react` — base do Sheet (já em uso)
- `tailwindcss v4` — config via CSS, sem `tailwind.config.ts`

### Learnings das stories anteriores (especialmente 3.4 — Story imediatamente anterior)

- **Componentes ad-hoc inline criaram débito visual** — Story 3.4 implementou `TransactionListRow` e `TransactionListFilters` sob a regra "não criar componentes novos sem workflow DS". A consequência foi `TransactionList.tsx` com componentes locais que agora precisam ser deletados quando a 3.4c migrar para os componentes DS desta story (3.4b). Lição: a Barreira 4 evita esse retrabalho.
- **Tokens granulares importam** — adicionar `--color-negative` agora evita hardcode em N lugares no futuro.
- **Sheet com estado local + commit no Aplicar** é um padrão que vai aparecer em outras telas (filtros de relatório, modal de seleção). Implementar bem aqui pavimenta para o resto.
- **Selects `@base-ui/react`**: `Select.Value` NÃO aceita `placeholder` — usar `children={...}`. Lição da 3.2.
- **localStorage mock necessário em testes JSDOM** — Node 22+ (CLAUDE.md). Caso seus testes acidentalmente toquem localStorage (não devem nesta story), ter o `vi.stubGlobal` pronto.
- **Sincronização prop→state em componentes controlados** — `useEffect(() => setX(initial), [initial])`. Lição da 3.2/3.3 — relevante para o state reset do `TransactionFiltersSheet`.
- **Não pedir refatorações em code review** — esta story já é o "extrair componentes". Code review deve focar em bugs reais (callbacks, stopPropagation, reset state, tokens), não em "poderia ser melhor estruturado".

### Project Structure Notes

- Alinhamento total com estrutura existente: `src/client/components/ui/<componente>.tsx` + teste adjacente
- Rota `/design-system` já existe — apenas evoluímos o conteúdo
- Nenhum conflito arquitetural — esta story só ADICIONA componentes (e remove `ListaTransacoesSection` ad-hoc)
- **Sem migrations de DB** — apenas validação de DTO existente

### References

- [Source: _bmad-output/prototypes/proto-18-tela-transacoes-spec.md] — **fonte canônica** desta story
- [Source: _bmad-output/prototypes/proto-18-tela-transacoes.html] — protótipo visual canônico
- [Source: _bmad-output/prototypes/study-3-4-linha-transacao-evolucao.html] — histórico de evolução da linha
- [Source: _bmad-output/prototypes/study-3-4-filtros-evolucao.html] — histórico de evolução dos filtros
- [Source: _bmad-output/implementation-artifacts/3-4-listagem-e-historico-de-transacoes.md] — Story 3.4 (componentes ad-hoc atuais a serem substituídos)
- [Source: _bmad-output/implementation-artifacts/2-5-7-enforcement-e-workflow.md] — Barreira 4 (workflow de componente novo)
- [Source: _bmad-output/implementation-artifacts/2-5-6-component-library-componentes-novos-epic-3.md] — padrão de criação de componentes UI
- [Source: src/app/design-system/page.tsx — `ListaTransacoesSection` (~1829), `ChipsSection` (~4054), `SeletorMesSection` (~1724), `ControleSegmentadoSection` (~1772)]
- [Source: src/app/globals.css] — tokens existentes
- [Source: src/client/components/ui/bank-logo.tsx, sheet.tsx, button.tsx, skeleton.tsx, badge.tsx, credit-card-brand-badge.tsx]
- [Source: src/server/infrastructure/database/schema/categories.ts:10] — confirma `emoji` é `notNull` com default

## Dev Agent Record

### Agent Model Used

claude-opus-4-7 (1M context)

### Debug Log References

- Suite completa: `npx vitest run` → 136 arquivos, 1099 testes, 100% passando
- Tipagem: `npx tsc --noEmit` → 0 erros
- Lint: `npx eslint src --max-warnings=0` → 0 warnings (removido import órfão `Bus` em `design-system/page.tsx`)
- Build: `npx next build` → sucesso, rotas `/design-system` e `/transactions` compilam
- Smoke test navegador ficará a cargo do usuário — `/design-system` é auth-gated e exige login

### Completion Notes List

**Fase 1 — Tokens (`src/app/globals.css`):**
- Adicionado `--color-negative: #DC2626` no bloco `@theme {}` (gera `text-negative`, `border-l-negative`)
- Adicionado `--breakpoint-xs: 380px` no mesmo bloco (gera utilities `xs:*` — Tailwind v4)
- Tokens existentes (`critical`, `positive`, `info`) inalterados

**Fase 2 — Backend (`emoji` no DTO de categoria):**
- `emoji` já está em `Category` type (`src/server/domain/categories/repositories/category.repository.ts:4`) e no mock do teste
- Schema `notNull` com default `'📁'` — `listCategoriesAction` já expõe
- Nenhuma mudança backend foi necessária

**Fase 3 — `TransactionRow`:**
- Suporta 3 tipos (`expense`/`income`/`transfer`) com faixa lateral colorida, ícone circular (emoji/letter/lucide), conteúdo e valor formatados
- Transferência renderiza `BankLogo` + nome do banco (nome oculto abaixo de 380px via `hidden xs:inline`)
- Botão `MoreVertical` com `stopPropagation` — testado explicitamente
- Botão só renderiza quando `onAction` é passado
- 9 testes cobrindo render, callbacks, ícones, stopPropagation

**Fase 4 — `TransactionSummaryCards`:**
- 3 cards (Saídas/Entradas/Transferências) com cores de label por tipo
- Variante compacta em mobile via classes Tailwind responsivas (sem media-query JS) — labels/valores/paddings adaptados
- Estado `isLoading` mostra 3 `Skeleton` com mesma estrutura
- Mantém cards com `R$ 0,00` quando sem dados (não esconde)
- 5 testes cobrindo variantes

**Fase 5 — `TransactionFiltersBar`:**
- Linha única flex-wrap com 4 sub-blocos: busca expansível (`flex-1`), segmented control de tipo, pílula de mês, botão Filtros com badge
- Pílula de mês implementada como **callback puro** (`onMonthClick`) — consumer decide popover/toggle. Simplifica testes e mantém componente controlado
- Segmented control usa `role="radiogroup"` + `aria-checked` (acessibilidade)
- Badge numérico aparece só quando `activeFiltersCount > 0`. Botão muda visual (`border-primary bg-primary-light`) quando ativo
- `formatMonthLabel` exportado para reuso (com capitalização do primeiro char)
- 14 testes (helper + componente)

**Fase 6 — `TransactionFiltersSheet`:**
- Sheet `side="right"`, `sm:max-w-[360px]`, 100% width em mobile
- **Estado local** (cópia de Sets) sincronizado com props apenas no `open: false → true` via `useEffect` — evita stale state
- **Draft/commit:** mudanças ficam locais até clique em Aplicar — fechar sem aplicar descarta
- Limpar zera só a seleção local (não chama nenhum callback externo)
- Aplicar envia **novas Sets** (`new Set(...)`) para o callback — impede que mutações externas afetem o estado interno
- Sheet fecha automaticamente após Aplicar
- Usa `<input type="checkbox">` nativo com `accent-primary` (não existia `Checkbox` no DS — evitamos criar ad-hoc, seguindo escopo)
- Empty states para categorias/métodos vazios
- 7 testes incluindo teste de reset de estado ao reabrir (componente harness com state controlado)

**Fase 7 — `/design-system`:**
- Removida `ListaTransacoesSection` (antigo mock ad-hoc com dados hardcoded)
- Adicionadas 3 seções novas importando os componentes reais:
  - `TransactionRowSection` — 4 linhas reais (expense com emoji, expense com letter, income, transfer) em um container com `divide-y`
  - `TransactionSummaryCardsSection` — desktop, mobile (container 360px) e loading lado a lado
  - `TransactionFiltersSection` — `TransactionFiltersBar` interativo com state local + `TransactionFiltersSheet` real que aplica/cancela
- Helper `CodeSnippet` interno para renderizar blocos de código em cada seção
- Swatch `--color-negative` adicionado em `CoresSection` (subgrupo Status)
- Removido array `transacoes` que ficou órfão + import `Bus` de `lucide-react` não mais usado

**Decisões técnicas:**
- `pílula de mês` = callback puro (`onMonthClick`) em vez de popover embutido — mantém componente controlado e simples
- `onClear` da spec foi simplificado: Limpar é totalmente interno (zera estado local) — consumer recebe seleção vazia via `onApply` quando user clica Limpar + Aplicar
- Classes Tailwind responsivas (`md:*`, `xs:*`) preferidas a `useMediaQuery` — evita SSR mismatches
- Cópias de `Set` nos callbacks (`new Set(...)`) para imutabilidade
- Sem mudanças em `TransactionList.tsx`/`TransactionListRow.tsx`/`TransactionListFilters.tsx` — Story 3.4 sem regressão (escopo delimitado para 3.4c)

### File List

**Novos:**
- `src/client/components/ui/transaction-row.tsx`
- `src/client/components/ui/transaction-row.test.tsx`
- `src/client/components/ui/transaction-summary-cards.tsx`
- `src/client/components/ui/transaction-summary-cards.test.tsx`
- `src/client/components/ui/transaction-filters-bar.tsx`
- `src/client/components/ui/transaction-filters-bar.test.tsx`
- `src/client/components/ui/transaction-filters-sheet.tsx`
- `src/client/components/ui/transaction-filters-sheet.test.tsx`

**Modificados:**
- `src/app/globals.css` — `--color-negative` e `--breakpoint-xs`
- `src/app/design-system/page.tsx` — removida `ListaTransacoesSection` ad-hoc; adicionadas `TransactionRowSection`, `TransactionSummaryCardsSection`, `TransactionFiltersSection`; import `Bus` removido; swatch `--color-negative` adicionado em Status
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — `3-4b-componentes-ds-transacoes`: `ready-for-dev` → `review`

## Change Log

- 2026-04-16 — Story 3.4b implementada: 4 componentes DS (`TransactionRow`, `TransactionSummaryCards`, `TransactionFiltersBar`, `TransactionFiltersSheet`) + tokens `--color-negative` e `--breakpoint-xs` + 3 seções novas em `/design-system`. Sem mudanças em `TransactionList.tsx` (escopo da 3.4c). Testes: 37 novos, suite 1099/1099 passando, tsc/eslint/build OK. Status: review.
- 2026-04-16 — Code review R1: sem HIGH/MEDIUM. 3 doc stales corrigidos (`onMonthChange` → `onMonthClick`, `onClear` removido da Task 6.1, count de testes 1097 → 1099). 3 LOWs registrados como backlog em "Fase 9: Review Follow-ups (AI)". Status: done.
