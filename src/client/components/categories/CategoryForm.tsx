'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/server/actions/category.actions';
import { PAYMENT_METHOD_TYPE_LABELS } from '@/shared/constants/category.constants';
import type { PaymentMethodType } from '@/shared/constants/category.constants';

interface Classification {
  id: string;
  name: string;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  status: 'active' | 'archived';
}

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  status: 'active' | 'archived';
}

type BudgetType = 'none' | 'fixed' | 'range';
type PaymentType = 'none' | PaymentMethodType;

interface CategoryFormProps {
  mode: 'create' | 'edit';
  classificationId?: string;
  defaultValues?: {
    id: string;
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  };
  classifications: Classification[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
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

const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'none', label: 'Nenhum' },
  ...Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => ({
    value: value as PaymentMethodType,
    label,
  })),
];

export function CategoryForm({
  mode,
  classificationId,
  defaultValues,
  classifications,
  bankAccounts,
  creditCards,
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
  const [budgetMinCents, setBudgetMinCents] = useState(defaultValues?.budgetMinCents ?? 0);
  const [budgetMaxCents, setBudgetMaxCents] = useState(defaultValues?.budgetMaxCents ?? 0);
  const [paymentType, setPaymentType] = useState<PaymentType>(
    (defaultValues?.defaultPaymentMethodType as PaymentMethodType) ?? 'none',
  );
  const [paymentMethodId, setPaymentMethodId] = useState(
    defaultValues?.defaultPaymentMethodId ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedClassification = classifications.find((c) => c.id === selectedClassificationId);

  const activeBankAccounts = bankAccounts.filter((a) => a.status === 'active');
  const activeCreditCards = creditCards.filter((c) => c.status === 'active');

  const instrumentOptions: { id: string; label: string; brand?: string }[] = paymentType === 'credit_card'
    ? activeCreditCards.map((c) => ({ id: c.id, label: c.name, brand: c.brand }))
    : paymentType === 'debit' || paymentType === 'pix'
      ? activeBankAccounts.map((a) => ({ id: a.id, label: `${a.bank} - ${a.name}` }))
      : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const budgetMinCentsValue = budgetType !== 'none' ? budgetMinCents : undefined;
    const budgetMaxCentsValue = budgetType === 'range' ? budgetMaxCents : undefined;

    const defaultPaymentMethodType = paymentType !== 'none' ? paymentType : null;
    const defaultPaymentMethodId = paymentType !== 'none' && paymentMethodId ? paymentMethodId : null;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createCategoryAction({
              name: name.trim(),
              classificationId: selectedClassificationId,
              budgetMinCents: budgetMinCentsValue,
              budgetMaxCents: budgetMaxCentsValue,
              defaultPaymentMethodType,
              defaultPaymentMethodId,
            })
          : await updateCategoryAction({
              id: defaultValues!.id,
              data: {
                name: name.trim(),
                classificationId: selectedClassificationId,
                budgetMinCents: budgetMinCentsValue ?? null,
                budgetMaxCents: budgetMaxCentsValue ?? null,
                defaultPaymentMethodType,
                defaultPaymentMethodId,
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
        <CurrencyInput
          value={budgetMinCents}
          onChange={setBudgetMinCents}
          label="Valor"
          id="budget-fixed"
          error={errors.budgetMinCents}
        />
      )}

      {budgetType === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            value={budgetMinCents}
            onChange={setBudgetMinCents}
            label="Mínimo"
            id="budget-min"
            error={errors.budgetMinCents}
          />
          <CurrencyInput
            value={budgetMaxCents}
            onChange={setBudgetMaxCents}
            label="Máximo"
            id="budget-max"
            error={errors.budgetMaxCents}
          />
        </div>
      )}

      {/* Método de pagamento padrão */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="payment-type">Método de pagamento padrão</Label>
        <Select
          value={paymentType}
          onValueChange={(val) => {
            if (val) {
              setPaymentType(val as PaymentType);
              setPaymentMethodId('');
            }
          }}
        >
          <SelectTrigger className="w-full" id="payment-type">
            <SelectValue>
              {PAYMENT_TYPE_OPTIONS.find((o) => o.value === paymentType)?.label ?? 'Nenhum'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {paymentType !== 'none' && instrumentOptions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="payment-instrument">
            {paymentType === 'credit_card' ? 'Cartão' : 'Conta'}
          </Label>
          <Select key={paymentType} value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val ?? '')}>
            <SelectTrigger className="w-full" id="payment-instrument">
              <SelectValue>
                {(() => {
                  const selected = instrumentOptions.find((o) => o.id === paymentMethodId);
                  if (!selected) return 'Selecione...';
                  if (selected.brand) {
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <CreditCardBrandBadge brand={selected.brand} />
                        {selected.label}
                      </span>
                    );
                  }
                  return selected.label;
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {instrumentOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.brand ? (
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCardBrandBadge brand={opt.brand} />
                      {opt.label}
                    </span>
                  ) : (
                    opt.label
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {paymentType !== 'none' && instrumentOptions.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {paymentType === 'credit_card'
            ? 'Nenhum cartão de crédito ativo cadastrado.'
            : 'Nenhuma conta bancária ativa cadastrada.'}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || name.trim().length === 0 || !selectedClassificationId || (paymentType !== 'none' && !paymentMethodId)}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}
