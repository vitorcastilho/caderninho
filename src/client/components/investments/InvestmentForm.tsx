'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { createInvestmentAction, updateInvestmentAction } from '@/server/actions/investment.actions';
import { INVESTMENT_TYPE_LABELS } from '@/shared/constants/investment.constants';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import { PercentageInput } from '@/client/components/ui/percentage-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';

type InvestmentType = 'renda_fixa' | 'renda_variavel' | 'reserva';

interface InvestmentFormProps {
  mode: 'create' | 'edit';
  defaultValues?: {
    id: string;
    name: string;
    institution: string;
    type: InvestmentType;
    balanceCents: number;
    yieldRateBasisPoints: number | null;
    maturityDate: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function showYieldAndMaturity(type: InvestmentType): boolean {
  return type === 'renda_fixa' || type === 'reserva';
}

export function InvestmentForm({ mode, defaultValues, onSuccess, onCancel }: InvestmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [institution, setInstitution] = useState(defaultValues?.institution ?? '');
  const [type, setType] = useState<InvestmentType>(defaultValues?.type ?? 'renda_fixa');
  const [balanceCents, setBalanceCents] = useState(defaultValues?.balanceCents ?? 0);
  const [yieldBasisPoints, setYieldBasisPoints] = useState(defaultValues?.yieldRateBasisPoints ?? 0);
  const [maturityDate, setMaturityDate] = useState(defaultValues?.maturityDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const yieldRateBasisPoints = showYieldAndMaturity(type)
      ? yieldBasisPoints
      : undefined;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createInvestmentAction({
              name,
              institution,
              type,
              balanceCents,
              yieldRateBasisPoints,
              maturityDate: maturityDate || undefined,
            })
          : await updateInvestmentAction({
              id: defaultValues!.id,
              data: {
                name,
                institution,
                type,
                balanceCents,
                yieldRateBasisPoints: showYieldAndMaturity(type)
                  ? yieldBasisPoints
                  : null,
                maturityDate: maturityDate || null,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create' ? 'Investimento criado com sucesso!' : 'Investimento atualizado com sucesso!',
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
        <Label htmlFor="name">Nome do investimento</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: CDB Banco X"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="institution">Instituição</Label>
        <Input
          id="institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Ex: Nubank"
          aria-invalid={!!errors.institution}
        />
        {errors.institution && <p className="text-xs text-destructive">{errors.institution}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Tipo</Label>
        <Select
          value={type}
          onValueChange={(val) => setType(val as InvestmentType)}
        >
          <SelectTrigger className="w-full" aria-invalid={!!errors.type}>
            <SelectValue>{INVESTMENT_TYPE_LABELS[type]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
      </div>

      <CurrencyInput
        value={balanceCents}
        onChange={setBalanceCents}
        label="Saldo atual (R$)"
        id="balance"
        error={errors.balanceCents}
      />

      {showYieldAndMaturity(type) && (
        <>
          <PercentageInput
            value={yieldBasisPoints}
            onChange={setYieldBasisPoints}
            label="Rendimento (% CDI)"
            id="yield"
            error={errors.yieldRateBasisPoints}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="maturityDate">Data de vencimento (opcional)</Label>
            <Input
              id="maturityDate"
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              aria-invalid={!!errors.maturityDate}
            />
            {errors.maturityDate && (
              <p className="text-xs text-destructive">{errors.maturityDate}</p>
            )}
          </div>
        </>
      )}

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
              ? 'Criar investimento'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
