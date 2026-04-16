'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';

import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import { PageHeader } from '@/client/components/ui/page-header';
import { EmptyState } from '@/client/components/ui/empty-state';
import { Skeleton } from '@/client/components/ui/skeleton';
import { formatCurrency } from '@/client/utils/format-currency';
import { listTransactionsAction } from '@/server/actions/transaction.actions';
import { EditExpenseSheet } from './EditExpenseSheet';
import { ConfirmDeleteTransactionDialog } from './ConfirmDeleteTransactionDialog';
import { TransactionListRow, resolveTransactionLabel } from './TransactionListRow';
import {
  TransactionListFilters,
  type MonthFilter,
  type TransactionListFiltersState,
  type TypeFilter,
} from './TransactionListFilters';

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

interface TransactionListProps {
  initialTransactions: TransactionDTO[];
  initialTotal: number;
  initialHasMore: boolean;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  incomeSources: IncomeSourceOption[];
}

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

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

function buildInitialFilters(): TransactionListFiltersState {
  return {
    search: '',
    type: 'all',
    categoryIds: new Set<string>(),
    paymentMethodIds: new Set<string>(),
    month: 'all',
  };
}

function monthToDateRange(month: MonthFilter): { dateFrom?: Date; dateTo?: Date } {
  if (month === 'all') return {};
  const dateFrom = new Date(month.year, month.month - 1, 1, 0, 0, 0, 0);
  const dateTo = new Date(month.year, month.month, 0, 23, 59, 59, 999);
  return { dateFrom, dateTo };
}

function filtersToActionInput(
  filters: TransactionListFiltersState,
  categories: CategoryOption[],
  bankAccounts: BankAccountOption[],
  creditCards: CreditCardOption[],
  pagination: { limit: number; offset: number },
) {
  const types: Array<'expense' | 'income' | 'transfer'> | undefined =
    filters.type === 'all' ? undefined : [filters.type];

  const categoryIdsList = Array.from(filters.categoryIds);

  // Expandir busca textual para incluir matches por nome de categoria/conta/cartão.
  const rawSearch = filters.search.trim();
  let combinedCategoryIds = categoryIdsList;
  let combinedPaymentMethodIds = Array.from(filters.paymentMethodIds);

  if (rawSearch.length > 0) {
    const lower = rawSearch.toLowerCase();
    const matchedCategoryIds = categories
      .filter((c) => c.name.toLowerCase().includes(lower))
      .map((c) => c.id);
    if (matchedCategoryIds.length > 0 && combinedCategoryIds.length === 0) {
      combinedCategoryIds = matchedCategoryIds;
    }

    const matchedBankIds = bankAccounts
      .filter(
        (a) =>
          a.name.toLowerCase().includes(lower) || a.bank.toLowerCase().includes(lower),
      )
      .map((a) => a.id);
    const matchedCardIds = creditCards
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lower) || c.brand.toLowerCase().includes(lower),
      )
      .map((c) => c.id);
    const matchedPaymentIds = [...matchedBankIds, ...matchedCardIds];
    if (matchedPaymentIds.length > 0 && combinedPaymentMethodIds.length === 0) {
      combinedPaymentMethodIds = matchedPaymentIds;
    }
  }

  const { dateFrom, dateTo } = monthToDateRange(filters.month);

  return {
    types,
    categoryIds: combinedCategoryIds.length > 0 ? combinedCategoryIds : undefined,
    paymentMethodIds:
      combinedPaymentMethodIds.length > 0 ? combinedPaymentMethodIds : undefined,
    dateFrom,
    dateTo,
    search: rawSearch.length > 0 ? rawSearch : undefined,
    limit: pagination.limit,
    offset: pagination.offset,
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
  categories,
  subcategories,
  bankAccounts,
  creditCards,
  incomeSources,
}: TransactionListProps) {
  // Chips de método só oferecem contas/cartões ativos (Task 5.5). Historicamente,
  // transações podem estar ligadas a contas arquivadas — `bankAccounts`/`creditCards`
  // completos continuam sendo passados para Row/EditExpenseSheet/LabelResolver para
  // que a resolução de rótulo e a edição funcionem em registros antigos.
  const activeBankAccounts = useMemo(
    () => bankAccounts.filter((a) => a.status === 'active'),
    [bankAccounts],
  );
  const activeCreditCards = useMemo(
    () => creditCards.filter((c) => c.status === 'active'),
    [creditCards],
  );

  const [filters, setFilters] = useState<TransactionListFiltersState>(buildInitialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [rows, setRows] = useState<TransactionDTO[]>(initialTransactions);
  const [total, setTotal] = useState<number>(initialTotal);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setRows(initialTransactions);
    setTotal(initialTotal);
    setHasMore(initialHasMore);
  }, [initialTransactions, initialTotal, initialHasMore]);

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
      try {
        const input = filtersToActionInput(
          currentFilters,
          categories,
          bankAccounts,
          creditCards,
          { limit: PAGE_SIZE, offset },
        );
        const result = await listTransactionsAction(input);
        if (myRequestId !== requestIdRef.current) return;
        if (!isActionSuccess<{ rows: TransactionDTO[]; total: number; hasMore: boolean }>(result)) {
          toast.error('Erro ao carregar transações.');
          return;
        }
        const data = result.data;
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
        }
      }
    },
    [categories, bankAccounts, creditCards],
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

  const handleClearFilters = useCallback(() => {
    setFilters(buildInitialFilters());
    setDebouncedSearch('');
  }, []);

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

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Transações' }]} className="mb-1" />
        <PageHeader title="Transações" />
      </div>

      <TransactionListFilters
        filters={filters}
        categories={categories}
        bankAccounts={activeBankAccounts}
        creditCards={activeCreditCards}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        onTypeChange={(type: TypeFilter) => setFilters((prev) => ({ ...prev, type }))}
        onToggleCategory={(id) =>
          setFilters((prev) => {
            const next = new Set(prev.categoryIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { ...prev, categoryIds: next };
          })
        }
        onTogglePaymentMethod={(id) =>
          setFilters((prev) => {
            const next = new Set(prev.paymentMethodIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return { ...prev, paymentMethodIds: next };
          })
        }
        onMonthChange={(month) => setFilters((prev) => ({ ...prev, month }))}
        onClearAll={handleClearFilters}
      />

      {isListEmpty && !isLoading ? (
        hasAnyActiveFilter ? (
          <EmptyState
            icon={Receipt}
            title="Nenhuma transação encontrada"
            description="Tente ajustar ou limpar os filtros ativos."
            actionLabel="Limpar filtros"
            onAction={handleClearFilters}
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
                {group.rows.map((tx) => (
                  <TransactionListRow
                    key={tx.id}
                    transaction={tx}
                    categories={categories}
                    bankAccounts={bankAccounts}
                    creditCards={creditCards}
                    incomeSources={incomeSources}
                    onClick={handleRowClick}
                    onDeleteClick={setDeletingTransaction}
                  />
                ))}
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
        labelResolver={(tx) => {
          const { primary } = resolveTransactionLabel(
            tx,
            categories,
            bankAccounts,
            incomeSources,
          );
          return `${formatCurrency(tx.amountCents)} — ${primary}`;
        }}
        onDeleted={refresh}
      />
    </div>
  );
}
