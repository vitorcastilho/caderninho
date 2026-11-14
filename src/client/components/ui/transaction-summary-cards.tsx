'use client';

import { ArrowLeftRight, TrendingDown, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/client/components/ui/skeleton';
import { formatCurrency } from '@/client/utils/format-currency';
import { cn } from '@/client/utils/utils';

export interface TransactionSummaryCardsProps {
  expense: { totalCents: number; count: number };
  income: { totalCents: number; count: number };
  transfer: { totalCents: number; count: number };
  isLoading?: boolean;
  /**
   * When true, always render the compact (mobile) variant, regardless of viewport.
   * When false/undefined (default), the component uses responsive classes to
   * switch between compact (below md) and spacious (md and up) automatically.
   *
   * Useful for demos (e.g., /design-system) where the component is placed in a
   * narrow container while the viewport is wide.
   */
  compact?: boolean;
  /**
   * Período que os totais representam. `'month'` (default) mantém os labels
   * "Saídas no mês"/"Entradas no mês"; `'all'` remove o "no mês" — usar quando o
   * consumer mostra totais sem recorte de mês (ex.: filtro "Todos os meses").
   */
  period?: 'month' | 'all';
}

type CardKey = 'expense' | 'income' | 'transfer';

interface CardConfig {
  key: CardKey;
  labelDesktop: string;
  labelDesktopAll: string;
  labelMobile: string;
  icon: LucideIcon;
  labelClass: string;
  valueClass: string;
  countLabelDesktop: string;
  countLabelMobile: string;
}

const CARD_ORDER: readonly CardConfig[] = [
  {
    key: 'expense',
    labelDesktop: 'Saídas no mês',
    labelDesktopAll: 'Saídas',
    labelMobile: 'Saídas',
    icon: TrendingDown,
    labelClass: 'text-negative',
    valueClass: 'text-foreground',
    countLabelDesktop: 'transações',
    countLabelMobile: 'trans.',
  },
  {
    key: 'income',
    labelDesktop: 'Entradas no mês',
    labelDesktopAll: 'Entradas',
    labelMobile: 'Entradas',
    icon: TrendingUp,
    labelClass: 'text-positive-text',
    valueClass: 'text-positive-text',
    countLabelDesktop: 'transações',
    countLabelMobile: 'trans.',
  },
  {
    key: 'transfer',
    labelDesktop: 'Transferências',
    labelDesktopAll: 'Transferências',
    labelMobile: 'Transf.',
    icon: ArrowLeftRight,
    labelClass: 'text-info-text',
    valueClass: 'text-muted-foreground',
    countLabelDesktop: 'movimentações',
    countLabelMobile: 'mov.',
  },
] as const;

export function TransactionSummaryCards({
  expense,
  income,
  transfer,
  isLoading,
  compact,
  period = 'month',
}: TransactionSummaryCardsProps) {
  const gridClass = cn(
    'grid grid-cols-3',
    compact ? 'gap-2' : 'gap-2 md:gap-3',
  );
  const cardHeightClass = compact ? 'h-[78px]' : 'h-[78px] md:h-[92px]';

  if (isLoading) {
    return (
      <div className={gridClass} data-slot="transaction-summary-cards-loading">
        {CARD_ORDER.map((cfg) => (
          <Skeleton
            key={cfg.key}
            className={cn(cardHeightClass, 'rounded-[10px]')}
          />
        ))}
      </div>
    );
  }

  const values: Record<CardKey, { totalCents: number; count: number }> = {
    expense,
    income,
    transfer,
  };

  return (
    <div className={gridClass} data-slot="transaction-summary-cards">
      {CARD_ORDER.map((cfg) => {
        const data = values[cfg.key];
        const Icon = cfg.icon;
        return (
          <div
            key={cfg.key}
            data-slot="transaction-summary-card"
            data-key={cfg.key}
            className={cn(
              'rounded-[10px] border border-border bg-card min-w-0',
              compact ? 'p-2.5' : 'p-2.5 md:p-4',
            )}
          >
            <div
              className={cn(
                'flex items-center font-semibold uppercase tracking-wider',
                compact
                  ? 'text-[9px] gap-1'
                  : 'text-[9px] md:text-[11px] gap-1 md:gap-1.5',
                cfg.labelClass,
              )}
            >
              <Icon
                className={cn(compact ? 'size-2.5' : 'size-2.5 md:size-3')}
                aria-hidden
              />
              {compact ? (
                <span>{cfg.labelMobile}</span>
              ) : (
                <>
                  <span className="hidden md:inline">
                    {period === 'all' ? cfg.labelDesktopAll : cfg.labelDesktop}
                  </span>
                  <span className="md:hidden">{cfg.labelMobile}</span>
                </>
              )}
            </div>
            {/* Mobile: text-xs + tracking-tight cabe até ~R$ 99.999,99 em 375px
                (Story 3.4f); truncate fica só como proteção para valores maiores. */}
            <div
              data-slot="transaction-summary-card-value"
              className={cn(
                'font-bold tabular-nums whitespace-nowrap truncate',
                compact
                  ? 'text-xs tracking-tight mt-1'
                  : 'text-xs tracking-tight md:text-xl md:tracking-normal mt-1 md:mt-1.5',
                cfg.valueClass,
              )}
            >
              {formatCurrency(data.totalCents)}
            </div>
            <div
              className={cn(
                'text-muted-foreground mt-0.5',
                compact ? 'text-[10px]' : 'text-[10px] md:text-[11px]',
              )}
            >
              {data.count}{' '}
              {compact ? (
                <span>{cfg.countLabelMobile}</span>
              ) : (
                <>
                  <span className="hidden md:inline">{cfg.countLabelDesktop}</span>
                  <span className="md:hidden">{cfg.countLabelMobile}</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
