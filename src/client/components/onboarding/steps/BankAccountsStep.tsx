'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createBankAccountAction } from '@/server/actions/bank-account.actions';
import { centsToDisplayValue, displayValueToCents } from '@/client/utils/currency-input';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';

interface BankAccountItem {
  id: string;
  name: string;
  bank: string;
  balanceCents: number;
}

interface BankAccountsStepProps {
  existingAccounts: BankAccountItem[];
  onNext: () => void;
  onSkip: () => void;
  onAccountAdded: (account: BankAccountItem) => void;
}

export function BankAccountsStep({ existingAccounts, onNext, onSkip, onAccountAdded }: BankAccountsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [balanceDisplay, setBalanceDisplay] = useState('0,00');

  function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();

    const balanceCents = displayValueToCents(balanceDisplay);

    startTransition(async () => {
      const result = await createBankAccountAction({ name, bank, balanceCents });

      if (result.success) {
        toast.success('Conta adicionada!');
        onAccountAdded(result.data as BankAccountItem);
        setName('');
        setBank('');
        setBalanceDisplay('0,00');
        setShowForm(false);
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-lg font-bold text-stone-900 mb-1">Suas contas bancárias</h2>
      <p className="text-[13px] text-stone-500 mb-4 leading-relaxed">
        Adicione as contas que você usa no dia a dia
      </p>

      {/* Lista de contas */}
      {existingAccounts.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {existingAccounts.filter(a => (a as BankAccountItem & { status?: string }).status !== 'archived').map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-2.5 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 transition-colors hover:border-stone-300"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-semibold text-indigo-600">
                {account.bank.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-stone-900">{account.name}</div>
                <div className="text-[11px] text-stone-500">
                  Saldo: R$ {centsToDisplayValue(account.balanceCents)}
                </div>
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded bg-green-50 text-xs text-green-800">
                ✓
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Formulário inline */}
      {showForm && (
        <form onSubmit={handleAddAccount} className="mb-3 rounded-md border border-indigo-200 bg-indigo-50 p-3">
          <div className="text-xs font-semibold text-indigo-600 mb-2">Adicionar conta</div>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-bank-name" className="text-xs text-stone-500">Nome do banco</Label>
              <Input
                id="onb-bank-name"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-account-name" className="text-xs text-stone-500">Nome da conta</Label>
              <Input
                id="onb-account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Conta Corrente"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-balance" className="text-xs text-stone-500">Saldo atual</Label>
              <Input
                id="onb-balance"
                value={`R$ ${balanceDisplay}`}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const cents = parseInt(digits || '0', 10);
                  setBalanceDisplay(centsToDisplayValue(cents));
                }}
                placeholder="R$ 0,00"
                inputMode="numeric"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || !name.trim() || !bank.trim()}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Botão adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-md border border-dashed border-indigo-400 px-4 py-2.5 text-[13px] font-medium text-indigo-600 transition-colors hover:border-indigo-500 hover:bg-indigo-50"
        >
          + Adicionar conta
        </button>
      )}

      {/* Ações do step */}
      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <button
          onClick={onNext}
          className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Próximo
        </button>
        <button
          onClick={onSkip}
          className="w-full rounded-md px-4 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-indigo-600 hover:bg-indigo-50"
        >
          Pular
        </button>
      </div>
    </div>
  );
}
