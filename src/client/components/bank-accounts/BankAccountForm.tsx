'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createBankAccountAction, updateBankAccountAction } from '@/server/actions/bank-account.actions';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';

interface BankAccountFormProps {
  mode: 'create' | 'edit';
  defaultValues?: {
    id: string;
    name: string;
    bank: string;
    balanceCents: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BankAccountForm({ mode, defaultValues, onSuccess, onCancel }: BankAccountFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [bank, setBank] = useState(defaultValues?.bank ?? '');
  const [balanceCents, setBalanceCents] = useState(defaultValues?.balanceCents ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createBankAccountAction({ name, bank, balanceCents })
          : await updateBankAccountAction({
              id: defaultValues!.id,
              data: { name, bank, balanceCents },
            });

      if (result.success) {
        toast.success(mode === 'create' ? 'Conta criada com sucesso!' : 'Conta atualizada com sucesso!');
        onSuccess?.();
      } else {
        if (result.error.details) {
          setErrors(result.error.details);
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome da conta</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Conta Corrente"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bank">Banco</Label>
        <Input
          id="bank"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="Ex: Nubank"
          aria-invalid={!!errors.bank}
        />
        {errors.bank && <p className="text-xs text-destructive">{errors.bank}</p>}
      </div>

      <CurrencyInput
        value={balanceCents}
        onChange={setBalanceCents}
        label="Saldo inicial (R$)"
        id="balance"
        error={errors.balanceCents}
      />

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar conta' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
