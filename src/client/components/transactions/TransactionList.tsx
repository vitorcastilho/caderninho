'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { toast } from 'sonner';
import { Receipt, MoreHorizontal } from 'lucide-react';

import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import { PageHeader } from '@/client/components/ui/page-header';
import { EmptyState } from '@/client/components/ui/empty-state';
import { Button } from '@/client/components/ui/button';
import { formatCurrency } from '@/client/utils/format-currency';
import { cn } from '@/client/utils/utils';
import { listTransactionsAction } from '@/server/actions/transaction.actions';
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
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  incomeSources: IncomeSourceOption[];
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return dateFormatter.format(d);
}

export function TransactionList({
  initialTransactions,
  categories,
  subcategories,
  bankAccounts,
  creditCards,
  incomeSources,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<TransactionDTO[]>(initialTransactions);
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionDTO | null>(null);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await listTransactionsAction(undefined);
      if (result.success) {
        setTransactions(result.data as TransactionDTO[]);
      } else {
        toast.error('Erro ao atualizar lista de transações.');
      }
    });
  }, []);

  function handleRowClick(tx: TransactionDTO) {
    if (tx.type === 'expense') {
      setEditingTransaction(tx);
    } else {
      toast.info('Edição disponível apenas para gastos nesta versão.');
    }
  }

  function resolveLabel(tx: TransactionDTO): { primary: string; secondary: string } {
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

  function resolveMethod(tx: TransactionDTO): string {
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

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Transações' }]} className="mb-1" />
        <PageHeader title="Transações" />
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Nenhuma transação registrada ainda"
          description="Registre um gasto, receita ou transferência para começar."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {transactions.map((tx) => {
            const { primary, secondary } = resolveLabel(tx);
            const method = resolveMethod(tx);
            const { sign, colorClass } = amountSign(tx);
            return (
              <li
                key={tx.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <button
                  type="button"
                  onClick={() => handleRowClick(tx)}
                  className="flex flex-1 items-center justify-between gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {primary}
                    </span>
                    {(secondary || method) && (
                      <span className="truncate text-xs text-muted-foreground">
                        {[secondary, method].filter(Boolean).join(' · ')}
                      </span>
                    )}
                    <span className="mt-0.5 text-[11px] text-text-tertiary">
                      {formatDate(tx.transactionDate)}
                    </span>
                  </div>
                  <span className={cn('text-base font-semibold tabular-nums', colorClass)}>
                    {sign}
                    {formatCurrency(tx.amountCents)}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeletingTransaction(tx)}
                  aria-label="Excluir transação"
                >
                  <MoreHorizontal />
                </Button>
              </li>
            );
          })}
        </ul>
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
          const { primary } = resolveLabel(tx);
          return `${formatCurrency(tx.amountCents)} — ${primary} — ${formatDate(tx.transactionDate)}`;
        }}
        onDeleted={refresh}
      />
    </div>
  );
}
