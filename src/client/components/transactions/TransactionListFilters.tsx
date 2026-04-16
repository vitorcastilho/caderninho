'use client';

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { cn } from '@/client/utils/utils';
import type {
  BankAccountOption,
  CategoryOption,
  CreditCardOption,
} from './TransactionList';

export type TypeFilter = 'all' | 'expense' | 'income' | 'transfer';
export type MonthFilter = { year: number; month: number } | 'all';

export interface TransactionListFiltersState {
  search: string;
  type: TypeFilter;
  categoryIds: Set<string>;
  paymentMethodIds: Set<string>;
  month: MonthFilter;
}

interface TransactionListFiltersProps {
  filters: TransactionListFiltersState;
  categories: CategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  onSearchChange: (value: string) => void;
  onTypeChange: (type: TypeFilter) => void;
  onToggleCategory: (id: string) => void;
  onTogglePaymentMethod: (id: string) => void;
  onMonthChange: (month: MonthFilter) => void;
  onClearAll: () => void;
}

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'expense', label: 'Saídas' },
  { id: 'income', label: 'Entradas' },
  { id: 'transfer', label: 'Transferências' },
];

const MONTH_SHORT_PT_BR = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

function formatMonthLabel(month: MonthFilter): string {
  if (month === 'all') return 'Tudo';
  return `${MONTH_SHORT_PT_BR[month.month - 1]} ${month.year}`;
}

function shiftMonth(month: MonthFilter, delta: number): MonthFilter {
  if (month === 'all') {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  const totalMonths = month.year * 12 + (month.month - 1) + delta;
  const year = Math.floor(totalMonths / 12);
  const monthIdx = ((totalMonths % 12) + 12) % 12;
  return { year, month: monthIdx + 1 };
}

function getLastNMonths(n: number): { year: number; month: number }[] {
  const now = new Date();
  const result: { year: number; month: number }[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return result;
}

function serializeMonth(month: MonthFilter): string {
  if (month === 'all') return 'all';
  return `${month.year}-${String(month.month).padStart(2, '0')}`;
}

function parseMonth(value: string): MonthFilter {
  if (value === 'all') return 'all';
  const [y, m] = value.split('-').map(Number);
  return { year: y, month: m };
}

export function TransactionListFilters({
  filters,
  categories,
  bankAccounts,
  creditCards,
  onSearchChange,
  onTypeChange,
  onToggleCategory,
  onTogglePaymentMethod,
  onMonthChange,
  onClearAll,
}: TransactionListFiltersProps) {
  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.type !== 'all' ||
    filters.categoryIds.size > 0 ||
    filters.paymentMethodIds.size > 0 ||
    filters.month !== 'all';

  // Inclui o mês selecionado se ele cair fora dos últimos 12 meses (ex: usuário
  // navegou via setas para um mês futuro ou anterior ao range padrão). Sem isso,
  // o `<select>` exibiria a primeira option ("Tudo") quando o `value` não bate
  // com nenhuma `<option>`, mesmo com o estado interno correto.
  const baseMonths = getLastNMonths(12);
  const selectedMonth = filters.month;
  const concreteMonths: { year: number; month: number }[] = [...baseMonths];
  if (
    selectedMonth !== 'all' &&
    !concreteMonths.some(
      (m) => m.year === selectedMonth.year && m.month === selectedMonth.month,
    )
  ) {
    concreteMonths.push(selectedMonth);
    concreteMonths.sort(
      (a, b) => b.year * 12 + b.month - (a.year * 12 + a.month),
    );
  }
  const monthOptions: MonthFilter[] = ['all', ...concreteMonths];

  return (
    <div className="flex flex-col gap-3">
      {/* Linha 1: busca + mês */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nome, categoria, valor ou data"
            className="h-9 pl-8"
            aria-label="Buscar transações"
          />
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-[var(--radius-card)] border border-border bg-card px-2 py-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMonthChange(shiftMonth(filters.month, -1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <select
            value={serializeMonth(filters.month)}
            onChange={(e) => onMonthChange(parseMonth(e.target.value))}
            className="min-w-[92px] cursor-pointer appearance-none bg-transparent text-center text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
            aria-label="Selecionar mês"
          >
            {monthOptions.map((opt) => (
              <option key={serializeMonth(opt)} value={serializeMonth(opt)}>
                {formatMonthLabel(opt)}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onMonthChange(shiftMonth(filters.month, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Linha 2a: tipo (controle segmentado) */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <div className="inline-flex shrink-0 gap-0.5 rounded-[var(--radius-card)] border border-border bg-card p-[3px]">
          {TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant={filters.type === opt.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTypeChange(opt.id)}
              className={
                filters.type === opt.id ? 'rounded-[9px]' : 'rounded-[9px] bg-transparent'
              }
              aria-pressed={filters.type === opt.id}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Linha 2b: chips de categoria */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const active = filters.categoryIds.has(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onToggleCategory(cat.id)}
                className={cn(
                  'cursor-pointer rounded-badge px-3 py-1.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
                aria-pressed={active}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Linha 2c: chips de método (contas + cartões) */}
      {(bankAccounts.length > 0 || creditCards.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {bankAccounts.map((acc) => {
            const active = filters.paymentMethodIds.has(acc.id);
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onTogglePaymentMethod(acc.id)}
                className={cn(
                  'cursor-pointer rounded-badge px-3 py-1.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
                aria-pressed={active}
              >
                {acc.bank} · {acc.name}
              </button>
            );
          })}
          {creditCards.map((card) => {
            const active = filters.paymentMethodIds.has(card.id);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onTogglePaymentMethod(card.id)}
                className={cn(
                  'cursor-pointer rounded-badge px-3 py-1.5 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
                aria-pressed={active}
              >
                {card.brand} · {card.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Linha 3: limpar filtros */}
      {hasActiveFilters && (
        <div>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            <X className="size-3.5" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
