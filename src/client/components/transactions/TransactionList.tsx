'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';

import type { TransactionPeriodSummary } from '@/shared/types/transaction-summary';
import { getLastNMonthsBR, monthToDateRangeBR } from '@/shared/utils/month-range';

import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import { PageHeader } from '@/client/components/ui/page-header';
import { EmptyState } from '@/client/components/ui/empty-state';
import { Skeleton } from '@/client/components/ui/skeleton';
import { ActiveFilterChip } from '@/client/components/ui/active-filter-chip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { cn } from '@/client/utils/utils';
import { formatCurrency } from '@/client/utils/format-currency';
import {
  getTransactionPeriodSummaryAction,
  listTransactionsAction,
} from '@/client/actions/transaction.actions';
import {
  TransactionRow,
  type TransactionRowIcon,
} from '@/client/components/ui/transaction-row';
import { TransactionSummaryCards } from '@/client/components/ui/transaction-summary-cards';
import {
  TransactionFiltersBar,
  formatMonthLabel,
  type MonthFilter,
  type TransactionTypeFilter,
} from '@/client/components/ui/transaction-filters-bar';
import {
  TransactionFiltersSheet,
  type TransactionFilterPaymentMethod,
} from '@/client/components/ui/transaction-filters-sheet';
import { EditExpenseSheet } from './EditExpenseSheet';
import { ConfirmDeleteTransactionDialog } from './ConfirmDeleteTransactionDialog';

export interface TransactionDTO {
  id: string;
  type: string;
  amountCents: number;
  categoryId: string | null;
  subcategoryId: string | null;
  establishment: string | null;
  paymentMethodType: string | null;
  paymentMethodId: string | null;
  installments: number | null;
  description: string | null;
  incomeSourceId: string | null;
  sourceAccountId: string | null;
  destinationAccountId: string | null;
  transactionDate: Date | string;
  referenceMonth: string | null;
  organizationId: string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CategoryOption {
  id: string;
  name: string;
  classificationId: string;
  budgetMaxCents?: number | null;
  emoji?: string;
}

export interface SubcategoryOption {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodType?: string | null;
  defaultPaymentMethodId?: string | null;
}

export interface BankAccountOption {
  id: string;
  name: string;
  bank: string;
  status: string;
  balanceCents: number;
}

export interface CreditCardOption {
  id: string;
  name: string;
  brand: string;
  status: string;
}

export interface IncomeSourceOption {
  id: string;
  name: string;
}

interface TransactionListFiltersState {
  search: string;
  type: TransactionTypeFilter;
  categoryIds: Set<string>;
  paymentMethodIds: Set<string>;
  month: MonthFilter;
}

interface TransactionListProps {
  initialTransactions: TransactionDTO[];
  initialTotal: number;
  initialHasMore: boolean;
  initialSummary?: TransactionPeriodSummary;
  /** Mês usado no SSR — o estado inicial do client precisa bater com ele. */
  initialMonth: MonthFilter;
  /** A organização tem alguma transação (em qualquer mês)? Define o empty state. */
  hasAnyTransactions: boolean;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  incomeSources: IncomeSourceOption[];
}

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

const EMPTY_SUMMARY: TransactionPeriodSummary = {
  expense: { totalCents: 0, count: 0 },
  income: { totalCents: 0, count: 0 },
  transfer: { totalCents: 0, count: 0 },
};

const dayFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  return dayFormatter.format(date);
}

function buildInitialFilters(month: MonthFilter): TransactionListFiltersState {
  return {
    search: '',
    type: 'all',
    categoryIds: new Set<string>(),
    paymentMethodIds: new Set<string>(),
    month,
  };
}

// Mesmo recorte (fuso de Brasília) usado no SSR — ver `@/shared/utils/month-range`.
function monthToDateRange(month: MonthFilter): { dateFrom?: Date; dateTo?: Date } {
  if (month === 'all') return {};
  return monthToDateRangeBR(month);
}

function monthKey(month: MonthFilter): string {
  if (month === 'all') return 'all';
  return `${month.year}-${String(month.month).padStart(2, '0')}`;
}

// Helpers de transformação TransactionDTO → props de TransactionRow.
// Exportados para reuso em testes.

export function buildIcon(
  tx: TransactionDTO,
  categories: CategoryOption[],
): TransactionRowIcon {
  if (tx.type === 'income') return { kind: 'lucide', name: 'ArrowDownLeft' };
  if (tx.type === 'transfer') return { kind: 'lucide', name: 'ArrowLeftRight' };
  const cat = categories.find((c) => c.id === tx.categoryId);
  if (cat?.emoji) return { kind: 'emoji', value: cat.emoji };
  const letter = cat?.name?.charAt(0).toUpperCase();
  return { kind: 'letter', value: letter && letter.length > 0 ? letter : '?' };
}

export function buildMethod(
  tx: TransactionDTO,
  bankAccounts: BankAccountOption[],
  creditCards: CreditCardOption[],
): string | undefined {
  if (tx.type !== 'expense') return undefined;
  if (tx.paymentMethodType === 'credit') {
    const card = creditCards.find((c) => c.id === tx.paymentMethodId);
    return card ? `${card.brand} ${card.name}` : 'Crédito';
  }
  if (tx.paymentMethodType === 'debit' || tx.paymentMethodType === 'pix') {
    const acc = bankAccounts.find((a) => a.id === tx.paymentMethodId);
    const prefix = tx.paymentMethodType === 'pix' ? 'PIX' : 'Débito';
    return acc ? `${prefix} · ${acc.bank} · ${acc.name}` : prefix;
  }
  return undefined;
}

export function buildPrimary(
  tx: TransactionDTO,
  categories: CategoryOption[],
  incomeSources: IncomeSourceOption[],
): string | undefined {
  if (tx.type === 'expense') {
    const category = categories.find((c) => c.id === tx.categoryId);
    return tx.establishment || category?.name || 'Gasto';
  }
  if (tx.type === 'income') {
    const source = incomeSources.find((s) => s.id === tx.incomeSourceId);
    return source?.name || 'Receita';
  }
  // transfer: o componente DS renderiza os bancos como primary
  return undefined;
}

export function buildSecondary(
  tx: TransactionDTO,
  categories: CategoryOption[],
  bankAccounts: BankAccountOption[],
): string {
  if (tx.type === 'expense') {
    const category = categories.find((c) => c.id === tx.categoryId);
    return category?.name && tx.establishment ? category.name : '';
  }
  if (tx.type === 'income') {
    const account = bankAccounts.find((a) => a.id === tx.destinationAccountId);
    return account ? `→ ${account.bank} · ${account.name}` : 'Receita';
  }
  if (tx.type === 'transfer') {
    const src = bankAccounts.find((a) => a.id === tx.sourceAccountId);
    const dst = bankAccounts.find((a) => a.id === tx.destinationAccountId);
    const srcLabel = src ? src.name : '?';
    const dstLabel = dst ? dst.name : '?';
    return `${srcLabel} → ${dstLabel}`;
  }
  return '';
}

export function buildTransferEndpoints(
  tx: TransactionDTO,
  bankAccounts: BankAccountOption[],
): { source: { bank: string }; destination: { bank: string } } | undefined {
  if (tx.type !== 'transfer') return undefined;
  const src = bankAccounts.find((a) => a.id === tx.sourceAccountId);
  const dst = bankAccounts.find((a) => a.id === tx.destinationAccountId);
  return {
    source: { bank: src?.bank ?? '?' },
    destination: { bank: dst?.bank ?? '?' },
  };
}

function buildPaymentMethodOptions(
  activeBankAccounts: BankAccountOption[],
  activeCreditCards: CreditCardOption[],
): TransactionFilterPaymentMethod[] {
  return [
    ...activeBankAccounts.map(
      (a): TransactionFilterPaymentMethod => ({
        id: a.id,
        label: a.name,
        bankName: a.bank,
      }),
    ),
    ...activeCreditCards.map(
      (c): TransactionFilterPaymentMethod => ({
        id: c.id,
        label: c.name,
        cardBrand: c.brand,
      }),
    ),
  ];
}

/** Texto do diálogo de exclusão — reaproveita os mesmos helpers da linha. */
export function buildDeleteLabel(
  tx: TransactionDTO,
  categories: CategoryOption[],
  bankAccounts: BankAccountOption[],
  incomeSources: IncomeSourceOption[],
): string {
  const primary = buildPrimary(tx, categories, incomeSources);
  const label =
    primary ?? `Transferência ${buildSecondary(tx, categories, bankAccounts)}`;
  return `${formatCurrency(tx.amountCents)} — ${label}`;
}

// A busca vai crua para o servidor: lá ela casa estabelecimento, descrição,
// valor e também os nomes de categoria, subcategoria, conta, cartão e fonte de
// receita (Story 3.4d). Antes, o client transformava nomes em filtros de
// categoria/método — que se somavam (AND) à busca e não traziam nada.
function filtersToActionInput(
  filters: TransactionListFiltersState,
  pagination?: { limit: number; offset: number },
) {
  const types: Array<'expense' | 'income' | 'transfer'> | undefined =
    filters.type === 'all' ? undefined : [filters.type];
  const categoryIds = Array.from(filters.categoryIds);
  const paymentMethodIds = Array.from(filters.paymentMethodIds);
  const rawSearch = filters.search.trim();
  const { dateFrom, dateTo } = monthToDateRange(filters.month);

  return {
    types,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    paymentMethodIds: paymentMethodIds.length > 0 ? paymentMethodIds : undefined,
    dateFrom,
    dateTo,
    search: rawSearch.length > 0 ? rawSearch : undefined,
    ...(pagination ? { limit: pagination.limit, offset: pagination.offset } : {}),
  };
}

function isActionSuccess<T>(
  result: unknown,
): result is { success: true; data: T } {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    (result as { success: boolean }).success === true
  );
}

export function TransactionList({
  initialTransactions,
  initialTotal,
  initialHasMore,
  initialSummary,
  initialMonth,
  hasAnyTransactions,
  categories,
  subcategories,
  bankAccounts,
  creditCards,
  incomeSources,
}: TransactionListProps) {
  // Métodos de pagamento só listam contas/cartões ativos no filtro — histórico
  // de transações pode referenciar contas arquivadas, por isso as listas completas
  // continuam chegando para resolver labels via `buildMethod` e no EditExpenseSheet.
  const activeBankAccounts = useMemo(
    () => bankAccounts.filter((a) => a.status === 'active'),
    [bankAccounts],
  );
  const activeCreditCards = useMemo(
    () => creditCards.filter((c) => c.status === 'active'),
    [creditCards],
  );

  const paymentMethodOptions = useMemo(
    () => buildPaymentMethodOptions(activeBankAccounts, activeCreditCards),
    [activeBankAccounts, activeCreditCards],
  );

  const [filters, setFilters] = useState<TransactionListFiltersState>(() =>
    buildInitialFilters(initialMonth),
  );
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [rows, setRows] = useState<TransactionDTO[]>(initialTransactions);
  const [total, setTotal] = useState<number>(initialTotal);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<TransactionPeriodSummary | undefined>(
    initialSummary,
  );
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);

  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [monthSheetOpen, setMonthSheetOpen] = useState(false);

  useEffect(() => {
    setRows(initialTransactions);
    setTotal(initialTotal);
    setHasMore(initialHasMore);
  }, [initialTransactions, initialTotal, initialHasMore]);

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  // Debounce da busca
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [filters.search]);

  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionDTO | null>(null);

  const requestIdRef = useRef(0);
  const isFirstRenderRef = useRef(true);

  // Dependências granulares: `filters.search` é deliberadamente omitido — o reload
  // escuta apenas `debouncedSearch`, evitando um loadPage(0) a cada keystroke.
  const {
    type: filterType,
    categoryIds: filterCategoryIds,
    paymentMethodIds: filterPaymentMethodIds,
    month: filterMonth,
  } = filters;

  const buildEffectiveFilters = useCallback(
    (): TransactionListFiltersState => ({
      search: debouncedSearch,
      type: filterType,
      categoryIds: filterCategoryIds,
      paymentMethodIds: filterPaymentMethodIds,
      month: filterMonth,
    }),
    [debouncedSearch, filterType, filterCategoryIds, filterPaymentMethodIds, filterMonth],
  );

  const hasAnyActiveFilter =
    debouncedSearch.length > 0 ||
    filterType !== 'all' ||
    filterCategoryIds.size > 0 ||
    filterPaymentMethodIds.size > 0 ||
    filterMonth !== 'all';

  const loadPage = useCallback(
    async (offset: number, currentFilters: TransactionListFiltersState) => {
      const myRequestId = ++requestIdRef.current;
      setIsLoading(true);
      const shouldRefetchSummary = offset === 0;
      if (shouldRefetchSummary) setIsSummaryLoading(true);
      try {
        const listInput = filtersToActionInput(currentFilters, { limit: PAGE_SIZE, offset });
        const summaryInput = shouldRefetchSummary
          ? filtersToActionInput(currentFilters)
          : null;

        const [listResult, summaryResult] = await Promise.all([
          listTransactionsAction(listInput),
          shouldRefetchSummary
            ? getTransactionPeriodSummaryAction(summaryInput ?? {})
            : Promise.resolve(null),
        ]);

        if (myRequestId !== requestIdRef.current) return;

        // Summary é tratado antes (e independente) da lista: uma falha na lista
        // não deve descartar um summary válido.
        if (shouldRefetchSummary) {
          if (summaryResult && isActionSuccess<TransactionPeriodSummary>(summaryResult)) {
            setSummary(summaryResult.data);
          } else {
            // Mantém o último valor, mas avisa — senão os cards mostrariam totais
            // de outro filtro sem nenhuma indicação.
            toast.error('Não foi possível atualizar o resumo do período.');
          }
        }

        if (
          !isActionSuccess<{ rows: TransactionDTO[]; total: number; hasMore: boolean }>(
            listResult,
          )
        ) {
          toast.error('Erro ao carregar transações.');
          return;
        }
        const data = listResult.data;
        setTotal(data.total);
        setHasMore(data.hasMore);
        if (offset === 0) {
          setRows(data.rows);
        } else {
          setRows((prev) => [...prev, ...data.rows]);
        }
      } finally {
        if (myRequestId === requestIdRef.current) {
          setIsLoading(false);
          if (shouldRefetchSummary) setIsSummaryLoading(false);
        }
      }
    },
    [],
  );

  // Recarregar quando filtros (granulares) mudam — NÃO dispara por `filters.search`
  // porque a busca já é debounced para `debouncedSearch`.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    loadPage(0, buildEffectiveFilters());
  }, [filterType, filterCategoryIds, filterPaymentMethodIds, filterMonth, debouncedSearch, buildEffectiveFilters, loadPage]);

  // IntersectionObserver para scroll infinito
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasMore || isLoading) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore && !isLoading) {
          loadPage(rows.length, buildEffectiveFilters());
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, rows.length, buildEffectiveFilters, loadPage]);

  const handleRowClick = useCallback((tx: TransactionDTO) => {
    if (tx.type === 'expense') {
      setEditingTransaction(tx);
    } else {
      toast.info('Edição disponível apenas para gastos nesta versão.');
    }
  }, []);

  const refresh = useCallback(() => {
    loadPage(0, buildEffectiveFilters());
  }, [loadPage, buildEffectiveFilters]);

  // "Limpar filtros" do empty state: remove TODOS os recortes, inclusive o mês,
  // para mostrar o histórico completo (voltar ao mês inicial poderia ser no-op
  // quando o mês corrente está vazio).
  const handleClearAllFilters = useCallback(() => {
    setFilters(buildInitialFilters('all'));
    setDebouncedSearch('');
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      categoryIds: new Set<string>(),
      paymentMethodIds: new Set<string>(),
    }));
  }, []);

  const monthOptions = useMemo<MonthFilter[]>(() => {
    const baseMonths = getLastNMonthsBR(12);
    const selected = filterMonth;
    if (
      selected !== 'all' &&
      !baseMonths.some((m) => m.year === selected.year && m.month === selected.month)
    ) {
      baseMonths.push(selected);
      baseMonths.sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month));
    }
    return ['all', ...baseMonths];
  }, [filterMonth]);

  // Grouping por dia (client-side sobre rows já ordenadas DESC)
  const groups = useMemo(() => {
    const map = new Map<string, { date: Date; rows: TransactionDTO[] }>();
    const order: string[] = [];
    for (const tx of rows) {
      const d = toDate(tx.transactionDate);
      const key = dayKey(d);
      const existing = map.get(key);
      if (existing) {
        existing.rows.push(tx);
      } else {
        map.set(key, { date: d, rows: [tx] });
        order.push(key);
      }
    }
    return order.map((k) => {
      const entry = map.get(k)!;
      return { key: k, label: formatDayLabel(entry.date), rows: entry.rows };
    });
  }, [rows]);

  const isListEmpty = rows.length === 0;
  const summaryData = summary ?? EMPTY_SUMMARY;
  const activeFiltersCount = filterCategoryIds.size + filterPaymentMethodIds.size;
  const hasAdvancedFilters =
    filterCategoryIds.size > 0 || filterPaymentMethodIds.size > 0;

  const activeCategoryChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; emoji?: string }> = [];
    for (const id of filterCategoryIds) {
      const cat = categories.find((c) => c.id === id);
      if (cat) chips.push({ id, label: cat.name, emoji: cat.emoji });
    }
    return chips;
  }, [filterCategoryIds, categories]);

  const activePaymentChips = useMemo(() => {
    const chips: Array<{ id: string; label: string }> = [];
    for (const id of filterPaymentMethodIds) {
      const bank = activeBankAccounts.find((b) => b.id === id);
      if (bank) {
        chips.push({ id, label: `${bank.bank} · ${bank.name}` });
        continue;
      }
      const card = activeCreditCards.find((c) => c.id === id);
      if (card) {
        chips.push({ id, label: `${card.brand} ${card.name}` });
      }
    }
    return chips;
  }, [filterPaymentMethodIds, activeBankAccounts, activeCreditCards]);

  const removeCategory = (id: string) => {
    setFilters((prev) => {
      const next = new Set(prev.categoryIds);
      next.delete(id);
      return { ...prev, categoryIds: next };
    });
  };

  const removePaymentMethod = (id: string) => {
    setFilters((prev) => {
      const next = new Set(prev.paymentMethodIds);
      next.delete(id);
      return { ...prev, paymentMethodIds: next };
    });
  };

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Transações' }]} className="mb-1" />
        <PageHeader title="Transações" />
      </div>

      <TransactionSummaryCards
        expense={summaryData.expense}
        income={summaryData.income}
        transfer={summaryData.transfer}
        isLoading={isSummaryLoading}
        period={filterMonth === 'all' ? 'all' : 'month'}
      />

      <TransactionFiltersBar
        search={filters.search}
        type={filters.type}
        month={filters.month}
        activeFiltersCount={activeFiltersCount}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value }))
        }
        onTypeChange={(type) => setFilters((prev) => ({ ...prev, type }))}
        onMonthClick={() => setMonthSheetOpen(true)}
        onOpenAdvancedFilters={() => setFiltersSheetOpen(true)}
      />

      {hasAdvancedFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeCategoryChips.map((chip) => (
            <ActiveFilterChip
              key={`cat-${chip.id}`}
              onRemove={() => removeCategory(chip.id)}
              removeLabel={`Remover filtro ${chip.label}`}
            >
              {chip.emoji && <span>{chip.emoji}</span>}
              <span>{chip.label}</span>
            </ActiveFilterChip>
          ))}
          {activePaymentChips.map((chip) => (
            <ActiveFilterChip
              key={`pm-${chip.id}`}
              onRemove={() => removePaymentMethod(chip.id)}
              removeLabel={`Remover filtro ${chip.label}`}
            >
              {chip.label}
            </ActiveFilterChip>
          ))}
          <button
            type="button"
            onClick={clearAdvancedFilters}
            className="ml-2 text-xs italic text-muted-foreground hover:text-foreground"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {isListEmpty && !isLoading ? (
        // Usuário que nunca registrou nada vê o empty state de "primeiro uso",
        // mesmo com o mês corrente selecionado (Story 3.4d).
        hasAnyTransactions && hasAnyActiveFilter ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma transação encontrada"
            description="Tente ajustar ou limpar os filtros ativos."
            actionLabel="Limpar filtros"
            onAction={handleClearAllFilters}
          />
        ) : (
          <EmptyState
            icon={Receipt}
            title="Nenhuma transação registrada ainda"
            description="Registre um gasto, receita ou transferência para começar."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <section key={group.key} className="flex flex-col gap-1">
              <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {group.rows.map((tx) => {
                  const txType = tx.type as 'expense' | 'income' | 'transfer';
                  return (
                    <TransactionRow
                      key={tx.id}
                      type={txType}
                      primary={buildPrimary(tx, categories, incomeSources)}
                      secondary={buildSecondary(tx, categories, bankAccounts)}
                      amountCents={tx.amountCents}
                      method={buildMethod(tx, bankAccounts, creditCards)}
                      icon={buildIcon(tx, categories)}
                      transferEndpoints={buildTransferEndpoints(tx, bankAccounts)}
                      onClick={() => handleRowClick(tx)}
                      onAction={() => setDeletingTransaction(tx)}
                      actionLabel="Excluir transação"
                    />
                  );
                })}
              </ul>
            </section>
          ))}

          {isLoading && (
            <div className="flex flex-col gap-2" aria-label="Carregando transações">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          )}

          {!hasMore && rows.length > 0 && !isLoading && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Fim do histórico · {total} {total === 1 ? 'transação' : 'transações'}
            </p>
          )}

          <div ref={sentinelRef} aria-hidden="true" />
        </div>
      )}

      <TransactionFiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        categories={categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        paymentMethods={paymentMethodOptions}
        selectedCategoryIds={filters.categoryIds}
        selectedPaymentMethodIds={filters.paymentMethodIds}
        onApply={({ categoryIds, paymentMethodIds }) =>
          setFilters((prev) => ({ ...prev, categoryIds, paymentMethodIds }))
        }
      />

      <Sheet open={monthSheetOpen} onOpenChange={setMonthSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[320px] flex flex-col">
          <SheetHeader>
            <SheetTitle>Selecionar mês</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ul className="flex flex-col gap-0.5">
              {monthOptions.map((opt) => {
                const key = monthKey(opt);
                const activeKey = monthKey(filters.month);
                const active = key === activeKey;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, month: opt }));
                        setMonthSheetOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-muted/50 text-foreground',
                      )}
                      aria-pressed={active}
                    >
                      {formatMonthLabel(opt)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      <EditExpenseSheet
        open={!!editingTransaction}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        categories={categories}
        subcategories={subcategories}
        bankAccounts={bankAccounts}
        creditCards={creditCards}
        onSaved={refresh}
      />

      <ConfirmDeleteTransactionDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => {
          if (!open) setDeletingTransaction(null);
        }}
        transaction={deletingTransaction}
        labelResolver={(tx) =>
          buildDeleteLabel(tx, categories, bankAccounts, incomeSources)
        }
        onDeleted={refresh}
      />
    </div>
  );
}
