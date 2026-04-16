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
}

type CardKey = 'expense' | 'income' | 'transfer';

interface CardConfig {
  key: CardKey;
  labelDesktop: string;
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
}: TransactionSummaryCardsProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-3 gap-2 md:gap-3"
        data-slot="transaction-summary-cards-loading"
      >
        {CARD_ORDER.map((cfg) => (
          <Skeleton
            key={cfg.key}
            className="h-[78px] md:h-[92px] rounded-[10px]"
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
    <div
      className="grid grid-cols-3 gap-2 md:gap-3"
      data-slot="transaction-summary-cards"
    >
      {CARD_ORDER.map((cfg) => {
        const data = values[cfg.key];
        const Icon = cfg.icon;
        return (
          <div
            key={cfg.key}
            data-slot="transaction-summary-card"
            data-key={cfg.key}
            className="rounded-[10px] border border-border bg-card p-2.5 md:p-4"
          >
            <div
              className={cn(
                'flex items-center gap-1 md:gap-1.5 font-semibold uppercase tracking-wider',
                'text-[9px] md:text-[11px]',
                cfg.labelClass,
              )}
            >
              <Icon className="size-2.5 md:size-3" aria-hidden />
              <span className="hidden md:inline">{cfg.labelDesktop}</span>
              <span className="md:hidden">{cfg.labelMobile}</span>
            </div>
            <div
              className={cn(
                'font-bold tabular-nums mt-1 md:mt-1.5',
                'text-sm md:text-xl',
                cfg.valueClass,
              )}
            >
              {formatCurrency(data.totalCents)}
            </div>
            <div className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5">
              {data.count}{' '}
              <span className="hidden md:inline">{cfg.countLabelDesktop}</span>
              <span className="md:hidden">{cfg.countLabelMobile}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
