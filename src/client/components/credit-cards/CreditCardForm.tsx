'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createCreditCardAction, updateCreditCardAction } from '@/client/actions/credit-card.actions';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';

interface CreditCardFormProps {
  mode: 'create' | 'edit';
  defaultValues?: {
    id: string;
    name: string;
    brand: string;
    limitCents: number;
    closingDay: number;
    dueDay: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreditCardForm({ mode, defaultValues, onSuccess, onCancel }: CreditCardFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [brand, setBrand] = useState(defaultValues?.brand ?? '');
  const [limitCents, setLimitCents] = useState(defaultValues?.limitCents ?? 0);
  const [closingDay, setClosingDay] = useState(defaultValues?.closingDay?.toString() ?? '');
  const [dueDay, setDueDay] = useState(defaultValues?.dueDay?.toString() ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const closingDayNum = parseInt(closingDay || '0', 10);
    const dueDayNum = parseInt(dueDay || '0', 10);

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createCreditCardAction({ name, brand, limitCents, closingDay: closingDayNum, dueDay: dueDayNum })
          : await updateCreditCardAction({
              id: defaultValues!.id,
              data: { name, brand, limitCents, closingDay: closingDayNum, dueDay: dueDayNum },
            });

      if (result.success) {
        toast.success(mode === 'create' ? 'Cartão criado com sucesso!' : 'Cartão atualizado com sucesso!');
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
        <Label htmlFor="name">Nome do cartão</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Latam Pass Visa"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand">Bandeira</Label>
        <Input
          id="brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Ex: Visa"
          aria-invalid={!!errors.brand}
        />
        {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
      </div>

      <CurrencyInput
        value={limitCents}
        onChange={setLimitCents}
        label="Limite total (R$)"
        id="limit"
        error={errors.limitCents}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="closingDay">Dia de fechamento</Label>
          <Input
            id="closingDay"
            type="number"
            min={1}
            max={31}
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            placeholder="Ex: 10"
            inputMode="numeric"
            aria-invalid={!!errors.closingDay}
          />
          {errors.closingDay && <p className="text-xs text-destructive">{errors.closingDay}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dueDay">Dia de vencimento</Label>
          <Input
            id="dueDay"
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="Ex: 17"
            inputMode="numeric"
            aria-invalid={!!errors.dueDay}
          />
          {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay}</p>}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar cartão' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
