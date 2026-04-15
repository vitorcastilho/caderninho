'use client';

import { MoreVertical } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
import { formatCurrency } from '@/client/utils/format-currency';
import { cn } from '@/client/utils/utils';
import type {
  BankAccountOption,
  CategoryOption,
  CreditCardOption,
  IncomeSourceOption,
  TransactionDTO,
} from './TransactionList';

interface TransactionListRowProps {
  transaction: TransactionDTO;
  categories: CategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  incomeSources: IncomeSourceOption[];
  onClick: (tx: TransactionDTO) => void;
  onDeleteClick: (tx: TransactionDTO) => void;
}

function resolveLabel(
  tx: TransactionDTO,
  categories: CategoryOption[],
  bankAccounts: BankAccountOption[],
  incomeSources: IncomeSourceOption[],
): { primary: string; secondary: string } {
  if (tx.type === 'expense') {
    const category = categories.find((c) => c.id === tx.categoryId);
    const primary = tx.establishment || category?.name || 'Gasto';
    const secondary = category?.name && tx.establishment ? category.name : '';
    return { primary, secondary };
  }
  if (tx.type === 'income') {
    const source = incomeSources.find((s) => s.id === tx.incomeSourceId);
    const account = bankAccounts.find((a) => a.id === tx.destinationAccountId);
    return {
      primary: source?.name || 'Receita',
      secondary: account ? `→ ${account.bank} - ${account.name}` : '',
    };
  }
  if (tx.type === 'transfer') {
    const source = bankAccounts.find((a) => a.id === tx.sourceAccountId);
    const dest = bankAccounts.find((a) => a.id === tx.destinationAccountId);
    return {
      primary: 'Transferência',
      secondary: `${source?.name || '?'} → ${dest?.name || '?'}`,
    };
  }
  return { primary: tx.type, secondary: '' };
}

function resolveMethod(
  tx: TransactionDTO,
  bankAccounts: BankAccountOption[],
  creditCards: CreditCardOption[],
): string {
  if (tx.type !== 'expense') return '';
  if (tx.paymentMethodType === 'credit') {
    const card = creditCards.find((c) => c.id === tx.paymentMethodId);
    return card ? `${card.brand} ${card.name}` : 'Crédito';
  }
  if (tx.paymentMethodType === 'debit' || tx.paymentMethodType === 'pix') {
    const acc = bankAccounts.find((a) => a.id === tx.paymentMethodId);
    const prefix = tx.paymentMethodType === 'pix' ? 'PIX' : 'Débito';
    return acc ? `${prefix} · ${acc.bank} - ${acc.name}` : prefix;
  }
  return '';
}

function amountSign(tx: TransactionDTO): { sign: string; colorClass: string } {
  if (tx.type === 'income') return { sign: '+', colorClass: 'text-green-600' };
  if (tx.type === 'expense') return { sign: '−', colorClass: 'text-foreground' };
  return { sign: '', colorClass: 'text-muted-foreground' };
}

export function resolveTransactionLabel(
  tx: TransactionDTO,
  categories: CategoryOption[],
  bankAccounts: BankAccountOption[],
  incomeSources: IncomeSourceOption[],
): { primary: string; secondary: string } {
  return resolveLabel(tx, categories, bankAccounts, incomeSources);
}

export function TransactionListRow({
  transaction,
  categories,
  bankAccounts,
  creditCards,
  incomeSources,
  onClick,
  onDeleteClick,
}: TransactionListRowProps) {
  const { primary, secondary } = resolveLabel(transaction, categories, bankAccounts, incomeSources);
  const method = resolveMethod(transaction, bankAccounts, creditCards);
  const { sign, colorClass } = amountSign(transaction);
  const metaLine = [secondary, method].filter(Boolean).join(' · ');

  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
      <button
        type="button"
        onClick={() => onClick(transaction)}
        className="flex flex-1 items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{primary}</span>
          {metaLine && (
            <span className="truncate text-xs text-muted-foreground">{metaLine}</span>
          )}
        </div>
        <span
          className={cn('shrink-0 text-sm font-semibold tabular-nums', colorClass)}
          aria-label={`Valor ${formatCurrency(transaction.amountCents)}`}
        >
          {sign}
          {formatCurrency(transaction.amountCents)}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDeleteClick(transaction)}
        aria-label="Excluir transação"
      >
        <MoreVertical />
      </Button>
    </li>
  );
}
