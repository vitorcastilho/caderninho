'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createIncomeSourceAction, updateIncomeSourceAction } from '@/server/actions/income-source.actions';
import { EMPLOYMENT_TYPE_LABELS } from '@/shared/constants/income-source.constants';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';

type EmploymentType = 'pj_propria' | 'clt' | 'freelance' | 'outro';

interface IncomeSourceFormProps {
  mode: 'create' | 'edit';
  defaultValues?: {
    id: string;
    name: string;
    employmentType: EmploymentType;
    isRecurring: boolean;
    baseAmountCents: number | null;
    usualPaymentDay: number | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IncomeSourceForm({ mode, defaultValues, onSuccess, onCancel }: IncomeSourceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    defaultValues?.employmentType ?? 'clt',
  );
  const [isRecurring, setIsRecurring] = useState(defaultValues?.isRecurring ?? true);
  const [baseAmountCents, setBaseAmountCents] = useState(defaultValues?.baseAmountCents ?? 0);
  const [usualPaymentDay, setUsualPaymentDay] = useState(
    defaultValues?.usualPaymentDay?.toString() ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const baseAmountCentsValue = baseAmountCents > 0 ? baseAmountCents : undefined;
    const paymentDay = usualPaymentDay ? parseInt(usualPaymentDay, 10) : undefined;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createIncomeSourceAction({
              name,
              employmentType,
              isRecurring,
              baseAmountCents: baseAmountCentsValue,
              usualPaymentDay: paymentDay,
            })
          : await updateIncomeSourceAction({
              id: defaultValues!.id,
              data: {
                name,
                employmentType,
                isRecurring,
                baseAmountCents: baseAmountCents > 0 ? baseAmountCents : null,
                usualPaymentDay: usualPaymentDay ? parseInt(usualPaymentDay, 10) : null,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? 'Fonte de receita criada com sucesso!'
            : 'Fonte de receita atualizada com sucesso!',
        );
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
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Salário ACME"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tipo de vínculo</Label>
        <Select
          value={employmentType}
          onValueChange={(val) => setEmploymentType(val as EmploymentType)}
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.employmentType}>
            <SelectValue>{EMPLOYMENT_TYPE_LABELS[employmentType]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.employmentType && (
          <p className="text-xs text-destructive">{errors.employmentType}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          id="isRecurring"
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <Label htmlFor="isRecurring" className="cursor-pointer">
          Receita recorrente
        </Label>
      </div>

      <CurrencyInput
        value={baseAmountCents}
        onChange={setBaseAmountCents}
        label="Valor base mensal (R$) — opcional"
        id="baseAmount"
        error={errors.baseAmountCents}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="paymentDay">Dia habitual de pagamento — opcional</Label>
        <Input
          id="paymentDay"
          type="number"
          min={1}
          max={31}
          value={usualPaymentDay}
          onChange={(e) => setUsualPaymentDay(e.target.value)}
          placeholder="Ex: 5"
          inputMode="numeric"
          aria-invalid={!!errors.usualPaymentDay}
        />
        {errors.usualPaymentDay && (
          <p className="text-xs text-destructive">{errors.usualPaymentDay}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar fonte de receita'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
