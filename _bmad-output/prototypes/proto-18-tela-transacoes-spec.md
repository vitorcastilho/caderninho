# Especificação UX · Tela `/transactions` (refinamento Story 3.4)

**Autora:** Sally (UX Designer)
**Data:** 2026-04-16
**Para:** dev de DS / dev da story de refinamento da 3.4
**Protótipo canônico:** `_bmad-output/prototypes/proto-18-tela-transacoes.html`
**Estudos (histórico):**
- `_bmad-output/prototypes/study-3-4-linha-transacao-evolucao.html` — evolução da linha (5 propostas → G)
- `_bmad-output/prototypes/study-3-4-filtros-evolucao.html` — evolução dos filtros (3 abordagens → 3)

> Esta spec define **3 componentes novos no DS** + **1 ajuste de backend** + **1 refatoração no consumer** (`/transactions`). É a versão consensuada com Vitorcastilho na rodada UX de 2026-04-16.

---

## 0. Workflow de Componentes Novos (Barreira 4)

Conforme Story 2.5.7, componentes novos seguem fluxo formal:

1. ✅ **Dev solicita** (Vitorcastilho identificou gaps visuais durante smoke test da Story 3.4)
2. ✅ **UX prototipa** (esta spec + `proto-18-tela-transacoes.html`)
3. ⏳ **DS implementa** os 3 componentes em `src/client/components/ui/` + atualiza `/design-system`
4. ⏳ **Backend** ajusta para retornar totais agregados
5. ⏳ **Dev consumer** refatora `TransactionList.tsx` e `page.tsx` para usar tudo

---

## 1. Visão geral das mudanças

| Tipo | Item | Status |
|---|---|---|
| **Componente novo (DS)** | `TransactionRow` — linha de transação com diferenciação visual por tipo | A criar |
| **Componente novo (DS)** | `TransactionSummaryCards` — 3 cards de resumo do período | A criar |
| **Componente novo (DS)** | `TransactionFiltersBar` — barra de filtros (segmented + pílula mês + botão sheet) | A criar |
| **Componente novo (DS)** | `TransactionFiltersSheet` — side sheet com Categoria + Método | A criar |
| **Backend** | Use case + action novos: `getTransactionPeriodSummary` (SUM por tipo no período filtrado) | A criar |
| **Backend** | DTO de categoria deve expor `emoji` no `listCategoriesAction` | Verificar/ajustar |
| **Refatoração** | `TransactionList.tsx` — consome novos componentes; `TransactionListRow.tsx` ad-hoc é deletado | A fazer |
| **Refatoração** | `page.tsx` (`/transactions`) — busca summary no SSR e passa para o componente | A fazer |
| **Token CSS** | Adicionar `--color-negative: #DC2626` em `globals.css` | Recomendado |

---

## 2. Componente: `TransactionRow`

**Localização:** `src/client/components/ui/transaction-row.tsx`
**Substitui:** `src/client/components/transactions/TransactionListRow.tsx` (ad-hoc, criado na Story 3.4)
**Reutilizável em:** `/transactions`, `/dashboard` (Epic 6 — widget "Transações recentes"), `/drill-down` (Epic 6.2)

### 2.1 Props

```ts
export type TransactionRowType = 'expense' | 'income' | 'transfer';

export interface TransactionRowProps {
  /** Tipo da transação — define faixa lateral, ícone e cor do valor */
  type: TransactionRowType;

  /** Texto principal (esquerda, bold). Para transferência, ignorado — usa `transferEndpoints` */
  primary?: string;

  /** Texto secundário (esquerda, muted). Ex: nome da categoria, "Receita", "Transferência" */
  secondary: string;

  /** Valor em centavos */
  amountCents: number;

  /** Texto do método (direita, abaixo do valor). Não exibe se ausente. */
  method?: string;

  /** Conteúdo do ícone circular esquerdo */
  icon:
    | { kind: 'emoji'; value: string }              // gasto com emoji
    | { kind: 'letter'; value: string }              // gasto sem emoji (fallback letra maiúscula)
    | { kind: 'lucide'; name: 'ArrowDownLeft' | 'ArrowLeftRight' };  // receita/transferência

  /** Para transferências: badges + nomes dos bancos no primary */
  transferEndpoints?: {
    source: { bank: string };
    destination: { bank: string };
  };

  /** Click na linha (ação primária — abrir sheet de edição) */
  onClick?: () => void;

  /** Ação no MoreVertical (geralmente abrir confirm dialog de exclusão) */
  onAction?: () => void;

  /** Aria-label do botão de ação. Default: "Mais opções". */
  actionLabel?: string;
}
```

### 2.2 Layout (3 colunas + faixa lateral)

```
┌─┬─────┬───────────────────────────┬─────────────────┬───┐
│⎯│ ICO │ NOME + CATEGORIA          │ VALOR + MÉTODO  │ ⋮ │
│3│ 36  │ flex (cresce)             │ auto (alinhado  │ 28│
│px│ px │                           │  à direita)     │ px│
└─┴─────┴───────────────────────────┴─────────────────┴───┘
```

**Container (Tailwind):**
```tsx
<li
  data-type={type}
  className={cn(
    "flex items-center gap-3 py-3 pl-[13px] pr-4 transition-colors hover:bg-muted/30 cursor-pointer",
    "border-l-[3px]",
    type === 'expense'  && "border-l-negative",
    type === 'income'   && "border-l-positive",
    type === 'transfer' && "border-l-info",
  )}
  onClick={onClick}
>
```

> `pl-[13px]` (em vez de `pl-4`) compensa os 3px da faixa lateral, mantendo o ícone alinhado a 16px do início real.

### 2.3 Tokens de cor por tipo

| Tipo | Faixa | Ícone bg | Ícone fg | Valor | Sinal |
|---|---|---|---|---|---|
| `expense` | `border-l-negative` (`#DC2626`) | `bg-muted` | `text-muted-foreground` | `text-foreground` | `−` |
| `income` | `border-l-positive` (`#22C55E`) | `bg-positive-bg` | `text-positive-text` | `text-positive-text` | `+` |
| `transfer` | `border-l-info` (`#3B82F6`) | `bg-info-bg` | `text-info-text` | `text-muted-foreground` | (nenhum) |

> Adicionar `--color-negative: #DC2626` em `src/app/globals.css` para gerar a utilidade `border-l-negative`. Sem isso, dev usa `style={{ borderLeftColor: '#DC2626' }}` como fallback.

### 2.4 Conteúdo do ícone circular

```tsx
<div className={cn(
  "size-9 shrink-0 rounded-full flex items-center justify-center",
  type === 'expense'  && "bg-muted text-muted-foreground",
  type === 'income'   && "bg-positive-bg text-positive-text",
  type === 'transfer' && "bg-info-bg text-info-text",
)}>
  {icon.kind === 'emoji'  && <span className="text-base leading-none">{icon.value}</span>}
  {icon.kind === 'letter' && <span className="text-sm font-semibold">{icon.value}</span>}
  {icon.kind === 'lucide' && <LucideIcon name={icon.name} className="size-4" />}
</div>
```

### 2.5 Conteúdo principal (centro)

**Saída e Receita:**
```tsx
<div className="flex min-w-0 flex-1 flex-col">
  <span className="truncate text-sm font-semibold text-foreground">{primary}</span>
  <span className="truncate text-xs text-muted-foreground">{secondary}</span>
</div>
```

**Transferência:**
```tsx
<div className="flex min-w-0 flex-1 flex-col">
  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
    <BankLogo bank={transferEndpoints.source.bank} size="sm" />
    <span className="text-sm font-semibold truncate hidden xs:inline">{transferEndpoints.source.bank}</span>
    <span className="text-muted-foreground text-xs">→</span>
    <BankLogo bank={transferEndpoints.destination.bank} size="sm" />
    <span className="text-sm font-semibold truncate hidden xs:inline">{transferEndpoints.destination.bank}</span>
  </div>
  <span className="text-xs text-muted-foreground">{secondary}</span>
</div>
```

> Breakpoint `xs` (380px): em Tailwind v4, configurar via `@theme { --breakpoint-xs: 380px; }` em `globals.css`. Se não, usar `hidden sm:inline`.

### 2.6 Coluna direita (valor + método)

```tsx
<div className="flex shrink-0 flex-col items-end">
  <span className={cn(
    "text-sm font-semibold tabular-nums",
    type === 'expense'  && "text-foreground",
    type === 'income'   && "text-positive-text",
    type === 'transfer' && "text-muted-foreground",
  )}>
    {sign}{formatCurrency(amountCents)}
  </span>
  {method && <span className="text-[11px] text-muted-foreground mt-0.5">{method}</span>}
</div>
```

`sign = type === 'expense' ? '−' : type === 'income' ? '+' : ''`

### 2.7 Botão de ação (MoreVertical)

```tsx
<button
  type="button"
  onClick={(e) => { e.stopPropagation(); onAction?.(); }}
  className="size-7 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
  aria-label={actionLabel ?? 'Mais opções'}
>
  <MoreVertical className="size-4" />
</button>
```

`stopPropagation` impede que o clique no botão dispare o `onClick` da linha.

---

## 3. Componente: `TransactionSummaryCards`

**Localização:** `src/client/components/ui/transaction-summary-cards.tsx`
**Reutilizável em:** `/transactions` (uso primário), `/dashboard` (futuro), telas de relatório

### 3.1 Props

```ts
export interface TransactionSummaryCardsProps {
  expense: { totalCents: number; count: number };
  income: { totalCents: number; count: number };
  transfer: { totalCents: number; count: number };
}
```

### 3.2 Layout

**Desktop (≥ 768px):** 3 cards lado a lado em grid `grid-cols-3 gap-3`.
**Mobile (< 768px):** 3 cards lado a lado em grid `grid-cols-3 gap-2`, com fonte e padding reduzidos.

### 3.3 Estrutura de cada card

```tsx
<div className="rounded-[10px] border border-border bg-card p-4">
  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider"
       style={{ color: labelColor }}>
    <Icon className="size-3" />
    {label}
  </div>
  <div className={cn(
    "text-xl font-bold tabular-nums mt-1.5",
    type === 'income' ? 'text-positive-text' :
    type === 'transfer' ? 'text-muted-foreground' :
    'text-foreground'
  )}>
    {formatCurrency(totalCents)}
  </div>
  <div className="text-[11px] text-muted-foreground mt-0.5">
    {count} {countLabel}
  </div>
</div>
```

| Card | Label | Ícone | Cor do label | countLabel |
|---|---|---|---|---|
| **Saídas** | "Saídas no mês" | `TrendingDown` | `text-negative` | `transações` |
| **Entradas** | "Entradas no mês" | `TrendingUp` | `text-positive-text` | `transações` |
| **Transferências** | "Transferências" | `ArrowLeftRight` | `text-info-text` | `movimentações` |

### 3.4 Variante mobile

Em mobile (< 768px), reduzir:
- Padding: `p-3` (em vez de `p-4`)
- Label: `text-[9px]`
- Valor: `text-sm` (em vez de `text-xl`)
- Meta: `text-[10px]`
- Texto do label: "Saídas", "Entradas", "Transf." (sem "no mês")
- Texto da meta: `12 trans.`, `2 trans.`, `2 mov.` (abreviado)

Exemplo mobile:
```tsx
<div className="rounded-lg border border-border bg-card p-2.5">
  <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-negative">
    <TrendingDown className="size-2.5" />
    Saídas
  </div>
  <div className="text-sm font-bold tabular-nums mt-1 text-foreground">R$ 1.247</div>
  <div className="text-[10px] text-muted-foreground">12 trans.</div>
</div>
```

> O componente deve detectar via media query (`useMediaQuery('(max-width: 767px)')`) ou apenas usar classes responsivas Tailwind para alternar variantes.

### 3.5 Estados

- **Loading:** mostrar `Skeleton` com a mesma estrutura
- **Sem dados no período:** mostrar `R$ 0,00` e `0 transações` — não esconder o card

---

## 4. Componente: `TransactionFiltersBar`

**Localização:** `src/client/components/ui/transaction-filters-bar.tsx`
**Substitui:** A linha de filtros chips empilhados do `TransactionListFilters.tsx` atual

### 4.1 Props

```ts
export type TransactionTypeFilter = 'all' | 'expense' | 'income' | 'transfer';
export type MonthFilter = { year: number; month: number } | 'all';

export interface TransactionFiltersBarProps {
  search: string;
  type: TransactionTypeFilter;
  month: MonthFilter;
  activeFiltersCount: number;             // soma de categoryIds + paymentMethodIds selecionados

  onSearchChange: (value: string) => void;
  onTypeChange: (type: TransactionTypeFilter) => void;
  onMonthChange: (month: MonthFilter) => void;
  onOpenAdvancedFilters: () => void;       // abre o TransactionFiltersSheet

  /** Renderização opcional de chips ativos abaixo. Pode ser feito pelo consumer. */
  activeChips?: React.ReactNode;
}
```

### 4.2 Layout

**Linha única** flex com gap-2 items-center flex-wrap:

```tsx
<div className="flex gap-2 items-center flex-wrap">
  {/* Busca — flex-1 (cresce), sem max-width — preenche todo espaço sobrando */}
  <div className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
    <Search className="size-4 text-muted-foreground shrink-0" />
    <input
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Buscar por nome, valor ou data"
      className="flex-1 bg-transparent text-sm outline-none"
    />
  </div>

  {/* Tipo — segmented control, shrink-0 */}
  <div className="inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-card p-[3px]">
    {TYPE_OPTIONS.map(opt => (
      <button
        key={opt.id}
        onClick={() => onTypeChange(opt.id)}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          type === opt.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>

  {/* Mês — pílula clicável */}
  <button
    onClick={() => /* abrir popover de mês */}
    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
  >
    <Calendar className="size-4 text-muted-foreground" />
    <span className="font-semibold">{formatMonthLabel(month)}</span>
    <ChevronDown className="size-4 text-muted-foreground" />
  </button>

  {/* Filtros — botão com badge */}
  <button
    onClick={onOpenAdvancedFilters}
    className={cn(
      "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
      activeFiltersCount > 0
        ? "border-primary bg-primary-light text-primary"
        : "border-border bg-card"
    )}
  >
    <SlidersHorizontal className="size-4" />
    Filtros
    {activeFiltersCount > 0 && (
      <span className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
        {activeFiltersCount}
      </span>
    )}
  </button>
</div>
```

**Constantes de tipo:**
```ts
const TYPE_OPTIONS: { id: TransactionTypeFilter; label: string; mobileLabel?: string }[] = [
  { id: 'all',      label: 'Tudo' },
  { id: 'expense',  label: 'Saídas' },
  { id: 'income',   label: 'Entradas' },
  { id: 'transfer', label: 'Transferências', mobileLabel: 'Transf.' },
];
```

### 4.3 Variante mobile

Em mobile (< 768px), o segmented control fica apertado e o label de "Transferências" é trocado por "Transf.":

```tsx
<button onClick={() => onTypeChange(opt.id)}>
  <span className="hidden md:inline">{opt.label}</span>
  <span className="md:hidden">{opt.mobileLabel ?? opt.label}</span>
</button>
```

E a linha pode quebrar em duas em mobile:
- Linha 1: Busca + Mês (compacto)
- Linha 2: Tipo segmentado (flex-1, distribuindo o espaço) + Filtros (ícone só, sem label)

### 4.4 Chips ativos abaixo (renderização do consumer)

Não fica dentro do `TransactionFiltersBar` — o consumer renderiza abaixo:

```tsx
<TransactionFiltersBar {...props} />

{(filters.categoryIds.size > 0 || filters.paymentMethodIds.size > 0) && (
  <div className="flex flex-wrap gap-1.5 items-center mt-3">
    {Array.from(filters.categoryIds).map(catId => {
      const cat = categories.find(c => c.id === catId);
      return (
        <Chip key={catId} onRemove={() => toggleCategory(catId)}>
          {cat?.emoji} {cat?.name}
        </Chip>
      );
    })}
    {Array.from(filters.paymentMethodIds).map(/* ... */)}
    {hasAnyAdvancedFilter && (
      <button onClick={clearAdvancedFilters} className="text-xs text-muted-foreground italic ml-2 hover:text-foreground">
        Limpar tudo
      </button>
    )}
  </div>
)}
```

### 4.5 Componente auxiliar `Chip` (já pode existir)

Visual: `bg-primary-light text-primary px-2.5 py-1 rounded-full text-xs font-medium` com `X` ao final, removível ao clicar.

---

## 5. Componente: `TransactionFiltersSheet`

**Localização:** `src/client/components/ui/transaction-filters-sheet.tsx`
**Padrão:** reusa `Sheet` (base-ui) com mesmo estilo de `EditExpenseSheet`/`ConfirmDeleteTransactionDialog`

### 5.1 Props

```ts
export interface TransactionFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  categories: { id: string; name: string; emoji?: string }[];
  paymentMethods: { id: string; label: string; bankName?: string; cardBrand?: string }[];

  selectedCategoryIds: Set<string>;
  selectedPaymentMethodIds: Set<string>;

  onApply: (selection: { categoryIds: Set<string>; paymentMethodIds: Set<string> }) => void;
  onClear: () => void;
}
```

### 5.2 Estrutura

```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="right" className="w-full sm:max-w-[360px] p-6 flex flex-col">
    <SheetHeader>
      <SheetTitle>Filtros</SheetTitle>
    </SheetHeader>

    <div className="flex-1 overflow-y-auto mt-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Categoria
      </h3>
      {categories.map(cat => (
        <label key={cat.id} className="flex items-center gap-2.5 py-2 cursor-pointer">
          <Checkbox
            checked={selectedCategoryIds.has(cat.id)}
            onCheckedChange={(checked) => /* toggle */}
          />
          {cat.emoji && <span>{cat.emoji}</span>}
          <span className="text-sm">{cat.name}</span>
        </label>
      ))}

      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-2">
        Método de pagamento
      </h3>
      {paymentMethods.map(pm => (
        <label key={pm.id} className="flex items-center gap-2.5 py-2 cursor-pointer">
          <Checkbox
            checked={selectedPaymentMethodIds.has(pm.id)}
            onCheckedChange={(checked) => /* toggle */}
          />
          {pm.bankName && <BankLogo bank={pm.bankName} size="sm" />}
          {pm.cardBrand && <CardBrand brand={pm.cardBrand} />}
          <span className="text-sm">{pm.label}</span>
        </label>
      ))}
    </div>

    <SheetFooter className="flex gap-2 pt-4 border-t border-border">
      <Button variant="outline" onClick={onClear} className="flex-1">Limpar</Button>
      <Button onClick={() => onApply({ /* current selection */ })} className="flex-1">
        Aplicar
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 5.3 Comportamento

- **Estado interno:** o sheet mantém uma cópia local da seleção (categoryIds, paymentMethodIds) que só é "commitada" quando o usuário clica **Aplicar**.
- **Cancelar:** fechar o sheet sem clicar Aplicar **descarta** as mudanças.
- **Limpar:** zera só os filtros do sheet (Categoria + Método). NÃO mexe em Tipo, Mês ou Busca (que ficam fora).
- **Mobile:** sheet ocupa 100% da largura.

---

## 6. Backend: `getTransactionPeriodSummary`

### 6.1 Use case

**Localização:** `src/server/domain/transactions/use-cases/get-transaction-period-summary.ts`

```ts
export interface GetTransactionPeriodSummaryParams {
  organizationId: string;
  filters: {
    types?: TransactionTypeFilter[];
    categoryIds?: string[];
    paymentMethodIds?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    searchAmountCents?: number | null;
  };
}

export interface TransactionPeriodSummary {
  expense: { totalCents: number; count: number };
  income: { totalCents: number; count: number };
  transfer: { totalCents: number; count: number };
}

export async function getTransactionPeriodSummary(
  deps: { repository: TransactionRepository },
  params: GetTransactionPeriodSummaryParams
): Promise<Result<TransactionPeriodSummary>> {
  // ... chama repository.aggregateByTypeForOrganizationFiltered
}
```

### 6.2 Repository

Adicionar em `transaction.repository.ts`:

```ts
aggregateByTypeForOrganizationFiltered(
  organizationId: string,
  filters: { /* mesmos filtros do findByOrganizationFiltered */ }
): Promise<{ type: 'expense' | 'income' | 'transfer'; totalCents: number; count: number }[]>;
```

**Implementação Drizzle (em `transaction.repository.impl.ts`):**

```ts
async aggregateByTypeForOrganizationFiltered(orgId, filters) {
  const conditions = [/* mesmos do findByOrganizationFiltered */];
  const results = await this.executor
    .select({
      type: transactions.type,
      totalCents: sql<number>`COALESCE(SUM(${transactions.amountCents}), 0)`.as('total_cents'),
      count: count(),
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(transactions.type);

  return results.map(r => ({
    type: r.type as 'expense' | 'income' | 'transfer',
    totalCents: Number(r.totalCents),
    count: Number(r.count),
  }));
}
```

### 6.3 Server action

**Localização:** `src/server/actions/transaction.actions.ts`

```ts
export const getTransactionPeriodSummaryAction = withAuth(async (session, input: unknown) => {
  const validated = validateInput(listTransactionsFilterSchema.optional(), input);
  // ... chama use case e retorna { expense, income, transfer }
});
```

### 6.4 Considerações de performance

- A query `SUM + count` agrupada por `type` aproveita os mesmos índices que `findByOrganizationFiltered` (`organizationId`, `transactionDate`).
- Roda em **paralelo** com a listagem (Promise.all) — sem latência adicional perceptível.
- Custo extra é mínimo: uma query agregada simples sobre o mesmo subset filtrado.

---

## 7. Refatoração no consumer (`/transactions`)

### 7.1 `page.tsx` (Server Component)

**Hoje:**
```tsx
const [tx, accounts, cards, ...] = await Promise.all([
  listTransactionsAction({}),
  listBankAccountsAction(undefined),
  // ...
]);
```

**Depois:**
```tsx
const [tx, summary, accounts, cards, ...] = await Promise.all([
  listTransactionsAction({}),
  getTransactionPeriodSummaryAction({}),  // ← NOVO
  listBankAccountsAction(undefined),
  // ...
]);

return (
  <TransactionList
    initialTransactions={tx.data?.rows ?? []}
    initialTotal={tx.data?.total ?? 0}
    initialHasMore={tx.data?.hasMore ?? false}
    initialSummary={summary.data}              // ← NOVO
    categories={categories.data ?? []}         // garantir que emoji vem
    bankAccounts={accounts.data ?? []}
    creditCards={cards.data ?? []}
    incomeSources={incomeSources.data ?? []}
  />
);
```

### 7.2 `TransactionList.tsx` (Client Component)

**Mudanças:**

1. Adicionar prop `initialSummary` e estado `summary`
2. Adicionar prop `categories[].emoji`
3. Substituir uso de `TransactionListRow` por `TransactionRow` no map
4. Substituir uso de `TransactionListFilters` por `TransactionFiltersBar` + `TransactionFiltersSheet`
5. Renderizar `TransactionSummaryCards` acima dos filtros
6. Re-buscar summary toda vez que filtros mudam (igual ao loadPage)

**Novo helper:**
```ts
function buildIcon(tx, categories): TransactionRowProps['icon'] {
  if (tx.type === 'expense') {
    const cat = categories.find(c => c.id === tx.categoryId);
    if (cat?.emoji) return { kind: 'emoji', value: cat.emoji };
    if (cat?.name)  return { kind: 'letter', value: cat.name[0]!.toUpperCase() };
    return { kind: 'letter', value: '?' };
  }
  if (tx.type === 'income')   return { kind: 'lucide', name: 'ArrowDownLeft' };
  if (tx.type === 'transfer') return { kind: 'lucide', name: 'ArrowLeftRight' };
  throw new Error('Unknown type');
}

function buildMethod(tx, bankAccounts, creditCards): string | undefined {
  if (tx.type === 'transfer') return undefined;
  if (tx.type === 'income') {
    const acc = bankAccounts.find(a => a.id === tx.destinationAccountId);
    return acc ? `${acc.bank} · ${acc.name}` : undefined;
  }
  if (tx.paymentMethodType === 'credit') {
    const card = creditCards.find(c => c.id === tx.paymentMethodId);
    return card ? `${card.brand} ${card.name}` : 'Crédito';
  }
  if (tx.paymentMethodType === 'debit' || tx.paymentMethodType === 'pix') {
    const acc = bankAccounts.find(a => a.id === tx.paymentMethodId);
    const suffix = tx.paymentMethodType === 'pix' ? 'PIX' : 'Débito';
    return acc ? `${acc.bank} · ${suffix}` : suffix;
  }
}

function buildPaymentMethodOptions(bankAccounts, creditCards): TransactionFiltersSheetProps['paymentMethods'] {
  return [
    ...bankAccounts.filter(a => a.status === 'active').map(a => ({
      id: a.id,
      label: `${a.bank} · ${a.name}`,
      bankName: a.bank,
    })),
    ...creditCards.filter(c => c.status === 'active').map(c => ({
      id: c.id,
      label: `${c.brand} ${c.name}`,
      cardBrand: c.brand,
    })),
  ];
}
```

### 7.3 `CategoryOption` (interface em `TransactionList.tsx`)

```ts
export interface CategoryOption {
  id: string;
  name: string;
  emoji?: string;          // ← NOVO (já existe no banco, é só expor)
  classificationId: string;
  budgetMaxCents?: number | null;
}
```

---

## 8. Entrada no Design System

**Localização:** `src/app/design-system/page.tsx`

**Substituir** `ListaTransacoesSection` (linha ~1829) por uma nova seção mais ampla, ou criar 3 seções separadas:

### 8.1 Sugestão de seções

```tsx
<TransactionSummaryCardsSection />   // novos
<TransactionFiltersSection />         // novos
<TransactionRowSection />             // substitui ListaTransacoesSection
```

Cada seção mostra:
- O componente real importado de `@/client/components/ui/...`
- Variantes desktop e mobile
- Snippet de uso
- Notas de anatomia

### 8.2 Snippets para o DS

```tsx
import { TransactionRow } from '@/client/components/ui/transaction-row';
import { TransactionSummaryCards } from '@/client/components/ui/transaction-summary-cards';
import { TransactionFiltersBar } from '@/client/components/ui/transaction-filters-bar';
import { TransactionFiltersSheet } from '@/client/components/ui/transaction-filters-sheet';

// Linha de transação
<TransactionRow
  type="expense"
  primary="Imperatriz"
  secondary="Alimentação"
  amountCents={10000}
  method="Master Inter"
  icon={{ kind: 'emoji', value: '🛒' }}
  onClick={() => {}}
  onAction={() => {}}
/>

// Cards de resumo
<TransactionSummaryCards
  expense={{ totalCents: 124700, count: 12 }}
  income={{ totalCents: 133498, count: 2 }}
  transfer={{ totalCents: 48303, count: 2 }}
/>

// Barra de filtros
<TransactionFiltersBar
  search=""
  type="all"
  month={{ year: 2026, month: 4 }}
  activeFiltersCount={2}
  onSearchChange={() => {}}
  onTypeChange={() => {}}
  onMonthChange={() => {}}
  onOpenAdvancedFilters={() => setSheetOpen(true)}
/>
```

---

## 9. Lista de arquivos afetados

### Novos
- `src/client/components/ui/transaction-row.tsx`
- `src/client/components/ui/transaction-row.test.tsx`
- `src/client/components/ui/transaction-summary-cards.tsx`
- `src/client/components/ui/transaction-summary-cards.test.tsx`
- `src/client/components/ui/transaction-filters-bar.tsx`
- `src/client/components/ui/transaction-filters-bar.test.tsx`
- `src/client/components/ui/transaction-filters-sheet.tsx`
- `src/client/components/ui/transaction-filters-sheet.test.tsx`
- `src/server/domain/transactions/use-cases/get-transaction-period-summary.ts`
- `src/server/domain/transactions/use-cases/get-transaction-period-summary.test.ts`

### Modificados
- `src/server/domain/transactions/repositories/transaction.repository.ts` — adicionar `aggregateByTypeForOrganizationFiltered`
- `src/server/infrastructure/database/repositories/transaction.repository.impl.ts` — implementar
- `src/server/actions/transaction.actions.ts` — adicionar `getTransactionPeriodSummaryAction`
- `src/server/actions/transaction.actions.test.ts` — testes da nova action
- `src/server/factories/transaction.ts` — injetar `getTransactionPeriodSummary` se aplicável
- `src/app/(app)/transactions/page.tsx` — buscar summary no SSR + propagar emoji da categoria
- `src/client/components/transactions/TransactionList.tsx` — refatoração consumindo todos os novos componentes
- `src/client/components/transactions/TransactionList.test.tsx` — adaptar testes
- `src/server/actions/category.actions.ts` (se necessário) — garantir emoji no DTO
- `src/app/globals.css` — adicionar `--color-negative` + breakpoint `xs` (Tailwind v4)
- `src/app/design-system/page.tsx` — substituir `ListaTransacoesSection` por 3 novas seções

### Deletados (após migração)
- `src/client/components/transactions/TransactionListRow.tsx` — substituído por `TransactionRow`
- `src/client/components/transactions/TransactionListFilters.tsx` — substituído por `TransactionFiltersBar` + `TransactionFiltersSheet`
- `src/client/components/transactions/TransactionListFilters.test.tsx` — substituído pelos testes dos componentes novos

---

## 10. Critérios de aceitância

### Componentes isolados (DS)
- [ ] `TransactionRow` renderiza nos 3 tipos com props corretas
- [ ] `TransactionRow` mostra emoji, letra ou lucide conforme `icon.kind`
- [ ] `TransactionRow` faixa lateral aparece com cor por tipo
- [ ] `TransactionRow` em mobile (< 380px) esconde nome do banco em transferências
- [ ] `TransactionRow` `onClick` e `onAction` funcionam independentemente (stopPropagation)
- [ ] `TransactionSummaryCards` renderiza 3 cards com cores e formatação corretas
- [ ] `TransactionSummaryCards` tem variante mobile compacta
- [ ] `TransactionFiltersBar` tipo segmentado, mês pílula, busca expandindo, botão Filtros com badge
- [ ] `TransactionFiltersBar` botão Filtros muda visual quando há filtros ativos (border + bg primary-light)
- [ ] `TransactionFiltersBar` em mobile mostra "Transf." abreviado
- [ ] `TransactionFiltersSheet` abre/fecha, marca/desmarca categorias e métodos, aplica/limpa
- [ ] `TransactionFiltersSheet` mantém estado local — só commita ao clicar Aplicar
- [ ] `TransactionFiltersSheet` em mobile ocupa 100% da largura

### `/design-system`
- [ ] 3 novas seções (ou 1 expandida) usando os componentes reais
- [ ] Variantes desktop e mobile visíveis
- [ ] Snippets de código copy-paste-friendly

### `/transactions` (após migração)
- [ ] Cards de resumo renderizam com totais corretos do período filtrado
- [ ] Cards atualizam quando qualquer filtro muda
- [ ] Linha usa `TransactionRow` (todos os 3 tipos visualmente diferenciados)
- [ ] Filtros usam `TransactionFiltersBar` + `TransactionFiltersSheet`
- [ ] Chips de filtros ativos aparecem abaixo da barra (categorias + métodos selecionados)
- [ ] "Limpar tudo" remove só categorias + métodos (mantém tipo, mês, busca)
- [ ] Componentes ad-hoc (`TransactionListRow`, `TransactionListFilters`) deletados
- [ ] Comportamento mantido: click abre sheet de edição, MoreVertical abre confirm de exclusão, scroll infinito, agrupamento por dia
- [ ] Smoke test manual em browser passa sem regressões

### Backend
- [ ] `getTransactionPeriodSummaryAction` retorna `{ expense, income, transfer }` com totalCents e count
- [ ] Filtros aplicados (tipo, categoria, método, data, busca) refletem no resultado
- [ ] Roda em paralelo com `listTransactionsAction` no SSR (Promise.all)
- [ ] Sem queries N+1 (uma única query agregada por `type`)

### Testes
- [ ] Cobertura de testes unitários nos 4 componentes novos
- [ ] Cobertura do use case `getTransactionPeriodSummary`
- [ ] Cobertura da action
- [ ] Testes adaptados em `TransactionList.test.tsx`
- [ ] Suite completa passando: `tsc 0 erros`, `eslint 0 warnings`, `vitest 100%`

---

## 11. Pendências de produto (não bloqueiam)

- **Transferência entre membros familiares** (Tamires ↔ Vitorcastilho): conversa pra ter com PM, possivelmente alinhada ao Epic 8 (Compartilhamento Familiar). Renderização não muda.

---

## 12. Próximos passos sugeridos

### Opção A — Quick spec única
Rodar `/bmad-bmm-quick-spec` apontando para esta spec → dev autônomo executa em 1 PR grande.

### Opção B — Story formal dividida (recomendado)
Criar 2 stories sequenciais:
1. **`3.4b-componentes-ds-transacoes`** — implementa os 4 componentes no DS + atualiza `/design-system` + adiciona token `negative` + ajusta DTO da categoria
2. **`3.4c-refatoracao-tela-transacoes`** — backend (use case + action) + refatora `TransactionList.tsx` consumindo os componentes + deleta ad-hoc

A divisão em 2 stories evita PR gigante, permite revisão visual no DS antes da migração da tela, e isola riscos.

### Opção C — Implementação direta
Pedir pro dev implementar com base nesta spec + protótipo HTML — mais rápido, sem cerimônia, mas perde rastreabilidade.

---

**Recomendação final (Sally):** **Opção B**. As 2 stories juntas devem caber em ~1 sprint. A story 3.4b (DS) é menos arriscada e pode ser revisada visualmente cedo. A 3.4c (refatoração) entra depois, com confiança de que os componentes funcionam.
