'use client';

import { ArrowDownLeft, ArrowLeftRight, MoreVertical } from 'lucide-react';

import { BankLogo } from '@/client/components/ui/bank-logo';
import { formatCurrency } from '@/client/utils/format-currency';
import { cn } from '@/client/utils/utils';

export type TransactionRowType = 'expense' | 'income' | 'transfer';

export type TransactionRowIcon =
  | { kind: 'emoji'; value: string }
  | { kind: 'letter'; value: string }
  | { kind: 'lucide'; name: 'ArrowDownLeft' | 'ArrowLeftRight' };

export interface TransactionRowProps {
  type: TransactionRowType;
  primary?: string;
  secondary: string;
  amountCents: number;
  method?: string;
  icon: TransactionRowIcon;
  transferEndpoints?: {
    source: { bank: string };
    destination: { bank: string };
  };
  onClick?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

const LUCIDE_ICONS = {
  ArrowDownLeft,
  ArrowLeftRight,
} as const;

const SIGN_BY_TYPE: Record<TransactionRowType, string> = {
  expense: '−',
  income: '+',
  transfer: '',
};

const BORDER_BY_TYPE: Record<TransactionRowType, string> = {
  expense: 'border-l-negative',
  income: 'border-l-positive',
  transfer: 'border-l-info',
};

const CIRCLE_BY_TYPE: Record<TransactionRowType, string> = {
  expense: 'bg-muted text-muted-foreground',
  income: 'bg-positive-bg text-positive-text',
  transfer: 'bg-info-bg text-info-text',
};

const AMOUNT_COLOR_BY_TYPE: Record<TransactionRowType, string> = {
  expense: 'text-foreground',
  income: 'text-positive-text',
  transfer: 'text-muted-foreground',
};

function renderIcon(icon: TransactionRowIcon) {
  if (icon.kind === 'emoji') {
    return <span className="text-base leading-none">{icon.value}</span>;
  }
  if (icon.kind === 'letter') {
    return <span className="text-sm font-semibold">{icon.value}</span>;
  }
  const LucideIcon = LUCIDE_ICONS[icon.name];
  return <LucideIcon className="size-4" aria-hidden />;
}

export function TransactionRow({
  type,
  primary,
  secondary,
  amountCents,
  method,
  icon,
  transferEndpoints,
  onClick,
  onAction,
  actionLabel,
}: TransactionRowProps) {
  const sign = SIGN_BY_TYPE[type];

  const content = (
    <>
      <div
        className={cn(
          'size-9 shrink-0 rounded-full flex items-center justify-center',
          CIRCLE_BY_TYPE[type],
        )}
        data-slot="transaction-row-icon"
      >
        {renderIcon(icon)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {type === 'transfer' && transferEndpoints ? (
          <>
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <BankLogo bank={transferEndpoints.source.bank} size="sm" />
              <span className="text-sm font-semibold truncate hidden xs:inline">
                {transferEndpoints.source.bank}
              </span>
              <span className="text-muted-foreground text-xs">→</span>
              <BankLogo bank={transferEndpoints.destination.bank} size="sm" />
              <span className="text-sm font-semibold truncate hidden xs:inline">
                {transferEndpoints.destination.bank}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{secondary}</span>
          </>
        ) : (
          <>
            {primary && (
              <span className="truncate text-sm font-semibold text-foreground">
                {primary}
              </span>
            )}
            <span className="truncate text-xs text-muted-foreground">{secondary}</span>
          </>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            AMOUNT_COLOR_BY_TYPE[type],
          )}
        >
          {sign}
          {formatCurrency(amountCents)}
        </span>
        {method && (
          <span className="text-[11px] text-muted-foreground mt-0.5">{method}</span>
        )}
      </div>
    </>
  );

  const contentClassName = 'flex min-w-0 flex-1 items-center gap-3 text-left';

  return (
    <li
      data-type={type}
      data-slot="transaction-row"
      className={cn(
        'flex items-center gap-3 py-3 pl-[13px] pr-4 transition-colors hover:bg-muted/30',
        'border-l-[3px]',
        BORDER_BY_TYPE[type],
      )}
    >
      {onClick ? (
        // <button> nativo: foco por Tab e ativação por Enter/Space sem handlers manuais.
        // O botão de ação fica como irmão (não aninhado) para evitar elementos
        // interativos dentro de interativos.
        <button
          type="button"
          onClick={onClick}
          data-slot="transaction-row-main"
          className={cn(
            contentClassName,
            'cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          )}
        >
          {content}
        </button>
      ) : (
        <div data-slot="transaction-row-main" className={contentClassName}>
          {content}
        </div>
      )}

      {onAction && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="size-7 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={actionLabel ?? 'Mais opções'}
        >
          <MoreVertical className="size-4" />
        </button>
      )}
    </li>
  );
}
