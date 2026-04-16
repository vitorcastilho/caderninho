'use client';

import { Calendar, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

import { cn } from '@/client/utils/utils';

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

interface TypeOption {
  id: TransactionTypeFilter;
  label: string;
  mobileLabel?: string;
}

const TYPE_OPTIONS: readonly TypeOption[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'expense', label: 'Saídas' },
  { id: 'income', label: 'Entradas' },
  { id: 'transfer', label: 'Transferências', mobileLabel: 'Transf.' },
] as const;

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
});

export function formatMonthLabel(month: MonthFilter): string {
  if (month === 'all') return 'Todos os meses';
  const date = new Date(month.year, month.month - 1, 1);
  const formatted = monthFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function TransactionFiltersBar({
  search,
  type,
  month,
  activeFiltersCount,
  onSearchChange,
  onTypeChange,
  onMonthClick,
  onOpenAdvancedFilters,
  searchPlaceholder,
}: TransactionFiltersBarProps) {
  return (
    <div
      className="flex gap-2 items-center flex-wrap"
      data-slot="transaction-filters-bar"
    >
      <div className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="size-4 text-muted-foreground shrink-0" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? 'Buscar por nome, valor ou data'}
          className="flex-1 min-w-0 bg-transparent text-sm outline-none"
          aria-label="Buscar transações"
        />
      </div>

      <div
        role="radiogroup"
        aria-label="Filtrar por tipo"
        className="inline-flex shrink-0 gap-0.5 rounded-lg border border-border bg-card p-[3px]"
      >
        {TYPE_OPTIONS.map((opt) => {
          const active = type === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onTypeChange(opt.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              data-active={active}
            >
              <span className="hidden md:inline">{opt.label}</span>
              <span className="md:hidden">{opt.mobileLabel ?? opt.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onMonthClick}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
        aria-label="Selecionar mês"
      >
        <Calendar className="size-4 text-muted-foreground" aria-hidden />
        <span className="font-semibold">{formatMonthLabel(month)}</span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onOpenAdvancedFilters}
        className={cn(
          'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
          activeFiltersCount > 0
            ? 'border-primary bg-primary-light text-primary'
            : 'border-border bg-card hover:bg-muted/30',
        )}
        aria-label="Abrir filtros avançados"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filtros
        {activeFiltersCount > 0 && (
          <span
            className="bg-primary text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center"
            data-slot="transaction-filters-bar-badge"
          >
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
}
