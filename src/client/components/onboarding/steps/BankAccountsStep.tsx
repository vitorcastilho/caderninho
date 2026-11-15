'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

import { createBankAccountAction, updateBankAccountAction, archiveBankAccountAction } from '@/client/actions/bank-account.actions';
import { centsToDisplayValue } from '@/client/utils/currency-input';
import { BankLogo } from '@/client/components/ui/bank-logo';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';

interface BankAccountItem {
  id: string;
  name: string;
  bank: string;
  balanceCents: number;
  status: string;
}

interface BankAccountsStepProps {
  existingAccounts: BankAccountItem[];
  onNext: () => void;
  onSkip: () => void;
  onAccountAdded: (account: BankAccountItem) => void;
  onAccountRemoved: (accountId: string) => void;
}

export function BankAccountsStep({ existingAccounts, onNext, onSkip, onAccountAdded, onAccountRemoved }: BankAccountsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [balanceCents, setBalanceCents] = useState(0);

  function resetForm() {
    setName('');
    setBank('');
    setBalanceCents(0);
    setEditingId(null);
    setShowForm(false);
  }

  function handleStartEdit(account: BankAccountItem) {
    setEditingId(account.id);
    setName(account.name);
    setBank(account.bank);
    setBalanceCents(account.balanceCents);
    setShowForm(true);
  }

  function handleRemoveAccount(id: string) {
    startTransition(async () => {
      const result = await archiveBankAccountAction({ id });
      if (result.success) {
        toast.success('Conta removida.');
        onAccountRemoved(id);
        resetForm();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      if (editingId) {
        const result = await updateBankAccountAction({ id: editingId, data: { name, bank, balanceCents } });
        if (result.success) {
          toast.success('Conta atualizada!');
          onAccountRemoved(editingId);
          onAccountAdded(result.data as BankAccountItem);
          resetForm();
        } else {
          toast.error(result.error.message);
        }
      } else {
        const result = await createBankAccountAction({ name, bank, balanceCents });
        if (result.success) {
          toast.success('Conta adicionada!');
          onAccountAdded(result.data as BankAccountItem);
          resetForm();
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  const activeAccounts = existingAccounts.filter(a => a.status !== 'archived');

  return (
    <div className="flex flex-1 flex-col">
      <h2 className="text-lg font-bold text-foreground mb-1">Suas contas bancárias</h2>
      <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed">
        Adicione as contas que você usa no dia a dia
      </p>

      {/* Lista de contas */}
      {activeAccounts.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {activeAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-2.5 rounded-md border border-border bg-secondary px-3 py-2.5 transition-colors hover:border-border-hover"
            >
              <BankLogo bank={account.bank} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground">{account.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Saldo: R$ {centsToDisplayValue(account.balanceCents)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleStartEdit(account)}
                disabled={isPending}
                title="Editar conta"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário inline (criar ou editar) */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 rounded-md border border-primary/20 bg-primary-light p-3">
          <div className="text-xs font-semibold text-primary mb-2">
            {editingId ? 'Editar conta' : 'Adicionar conta'}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-bank-name" className="text-xs text-muted-foreground">Nome do banco</Label>
              <Input
                id="onb-bank-name"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="onb-account-name" className="text-xs text-muted-foreground">Nome da conta</Label>
              <Input
                id="onb-account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Conta Corrente"
                className="h-8 text-sm"
              />
            </div>
            <CurrencyInput
              value={balanceCents}
              onChange={setBalanceCents}
              label="Saldo atual"
              id="onb-balance"
              className="h-8 text-sm"
              labelClassName="text-xs text-muted-foreground"
            />
            <div className="flex gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAccount(editingId)}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  Remover
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !name.trim() || !bank.trim()}
                className="flex-1"
              >
                {isPending ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Botão adicionar */}
      {!showForm && (
        <Button
          variant="outline"
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full border-dashed border-primary/40 text-primary hover:border-primary/60 hover:bg-primary-light"
        >
          + Adicionar conta
        </Button>
      )}

      {/* Ações do step */}
      <div className="mt-auto flex flex-col gap-1.5 pt-4">
        <Button onClick={onNext} className="w-full" size="lg">
          Próximo
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="w-full text-muted-foreground"
        >
          Pular
        </Button>
      </div>
    </div>
  );
}
