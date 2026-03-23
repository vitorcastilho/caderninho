'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';
import { centsToDisplayValue, displayValueToCents } from '@/client/utils/currency-input';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/server/actions/category.actions';

interface Classification {
  id: string;
  name: string;
}

type BudgetType = 'none' | 'fixed' | 'range';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  classificationId?: string;
  defaultValues?: {
    id: string;
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
  };
  classifications: Classification[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  none: 'Sem orçamento',
  fixed: 'Valor fixo',
  range: 'Faixa (min-max)',
};

function inferBudgetType(minCents: number | null, maxCents: number | null): BudgetType {
  if (minCents == null) return 'none';
  if (maxCents == null || maxCents === minCents) return 'fixed';
  return 'range';
}

export function CategoryForm({
  mode,
  classificationId,
  defaultValues,
  classifications,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [selectedClassificationId, setSelectedClassificationId] = useState(
    defaultValues?.classificationId ?? classificationId ?? '',
  );
  const [budgetType, setBudgetType] = useState<BudgetType>(
    defaultValues ? inferBudgetType(defaultValues.budgetMinCents, defaultValues.budgetMaxCents) : 'none',
  );
  const [budgetMinDisplay, setBudgetMinDisplay] = useState(
    defaultValues?.budgetMinCents ? centsToDisplayValue(defaultValues.budgetMinCents) : '0,00',
  );
  const [budgetMaxDisplay, setBudgetMaxDisplay] = useState(
    defaultValues?.budgetMaxCents ? centsToDisplayValue(defaultValues.budgetMaxCents) : '0,00',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedClassification = classifications.find((c) => c.id === selectedClassificationId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const budgetMinCents = budgetType !== 'none' ? displayValueToCents(budgetMinDisplay) : undefined;
    const budgetMaxCents = budgetType === 'range' ? displayValueToCents(budgetMaxDisplay) : undefined;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createCategoryAction({
              name: name.trim(),
              classificationId: selectedClassificationId,
              budgetMinCents,
              budgetMaxCents,
            })
          : await updateCategoryAction({
              id: defaultValues!.id,
              data: {
                name: name.trim(),
                classificationId: selectedClassificationId,
                budgetMinCents: budgetMinCents ?? null,
                budgetMaxCents: budgetMaxCents ?? null,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? `Categoria "${name.trim()}" criada.`
            : `Categoria "${name.trim()}" atualizada.`,
        );
        onSuccess?.();
      } else {
        if (result.error.details) {
          setErrors(result.error.details as Record<string, string>);
        } else {
          toast.error(result.error.message);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-name">Nome</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Moradia"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Classificação */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category-classification">Classificação</Label>
        <Select value={selectedClassificationId} onValueChange={(val) => setSelectedClassificationId(val ?? '')}>
          <SelectTrigger className="w-full" id="category-classification" aria-invalid={!!errors.classificationId}>
            <SelectValue>
              {selectedClassification?.name ?? 'Selecione...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {classifications.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.classificationId && <p className="text-xs text-destructive">{errors.classificationId}</p>}
      </div>

      {/* Tipo de orçamento */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="budget-type">Orçamento</Label>
        <Select value={budgetType} onValueChange={(val) => { if (val) setBudgetType(val as BudgetType); }}>
          <SelectTrigger className="w-full" id="budget-type">
            <SelectValue>{BUDGET_TYPE_LABELS[budgetType]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(BUDGET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget inputs */}
      {budgetType === 'fixed' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget-fixed">Valor</Label>
          <Input
            id="budget-fixed"
            value={`R$ ${budgetMinDisplay}`}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              const cents = parseInt(digits || '0', 10);
              setBudgetMinDisplay(centsToDisplayValue(cents));
            }}
            placeholder="R$ 0,00"
            inputMode="numeric"
            aria-invalid={!!errors.budgetMinCents}
          />
          {errors.budgetMinCents && <p className="text-xs text-destructive">{errors.budgetMinCents}</p>}
        </div>
      )}

      {budgetType === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-min">Mínimo</Label>
            <Input
              id="budget-min"
              value={`R$ ${budgetMinDisplay}`}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                const cents = parseInt(digits || '0', 10);
                setBudgetMinDisplay(centsToDisplayValue(cents));
              }}
              placeholder="R$ 0,00"
              inputMode="numeric"
              aria-invalid={!!errors.budgetMinCents}
            />
            {errors.budgetMinCents && <p className="text-xs text-destructive">{errors.budgetMinCents}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget-max">Máximo</Label>
            <Input
              id="budget-max"
              value={`R$ ${budgetMaxDisplay}`}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                const cents = parseInt(digits || '0', 10);
                setBudgetMaxDisplay(centsToDisplayValue(cents));
              }}
              placeholder="R$ 0,00"
              inputMode="numeric"
              aria-invalid={!!errors.budgetMaxCents}
            />
            {errors.budgetMaxCents && <p className="text-xs text-destructive">{errors.budgetMaxCents}</p>}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || name.trim().length === 0 || !selectedClassificationId}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
