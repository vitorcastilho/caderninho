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
  createEstablishmentAction,
  updateEstablishmentAction,
  deleteEstablishmentAction,
} from '@/server/actions/establishment.actions';
import { PAYMENT_METHOD_TYPE_LABELS } from '@/shared/constants/category.constants';
import type { PaymentMethodType } from '@/shared/constants/category.constants';

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

interface EstablishmentFormProps {
  mode: 'create' | 'edit';
  subcategoryId?: string;
  defaultValues?: {
    id: string;
    name: string;
    emoji: string;
    subcategoryId: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    visitCount: number;
    lastVisitAt: string | null;
  };
  subcategories: { id: string; name: string }[];
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

function formatLastVisit(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function EstablishmentForm({
  mode,
  subcategoryId,
  defaultValues,
  subcategories,
  bankAccounts,
  creditCards,
  onSuccess,
  onCancel,
}: EstablishmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? '📍');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(
    defaultValues?.subcategoryId ?? subcategoryId ?? '',
  );
  const [paymentType, setPaymentType] = useState<PaymentType>(
    (defaultValues?.defaultPaymentMethodType as PaymentMethodType) ?? 'none',
  );
  const [paymentMethodId, setPaymentMethodId] = useState(
    defaultValues?.defaultPaymentMethodId ?? '',
  );
  const [budgetType, setBudgetType] = useState<BudgetType>(
    defaultValues ? inferBudgetType(defaultValues.budgetMinCents, defaultValues.budgetMaxCents) : 'none',
  );
  const [budgetMinCents, setBudgetMinCents] = useState(defaultValues?.budgetMinCents ?? 0);
  const [budgetMaxCents, setBudgetMaxCents] = useState(defaultValues?.budgetMaxCents ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeBankAccounts = bankAccounts.filter((a) => a.status === 'active');
  const activeCreditCards = creditCards.filter((c) => c.status === 'active');

  const instrumentOptions: { id: string; label: string; brand?: string }[] = paymentType === 'credit'
    ? activeCreditCards.map((c) => ({ id: c.id, label: c.name, brand: c.brand }))
    : paymentType === 'debit' || paymentType === 'pix'
      ? activeBankAccounts.map((a) => ({ id: a.id, label: `${a.bank} - ${a.name}` }))
      : [];

  const selectedSubcategory = subcategories.find((s) => s.id === selectedSubcategoryId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const budgetMinCentsValue = budgetType !== 'none' ? budgetMinCents : null;
    const budgetMaxCentsValue = budgetType === 'range' ? budgetMaxCents : null;

    const defaultPaymentMethodType = paymentType !== 'none' ? paymentType : null;
    const defaultPaymentMethodIdValue = paymentType !== 'none' && paymentMethodId ? paymentMethodId : null;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createEstablishmentAction({
              name: name.trim(),
              emoji,
              subcategoryId: selectedSubcategoryId,
              defaultPaymentMethodType,
              defaultPaymentMethodId: defaultPaymentMethodIdValue,
              budgetMinCents: budgetMinCentsValue,
              budgetMaxCents: budgetMaxCentsValue,
            })
          : await updateEstablishmentAction({
              id: defaultValues!.id,
              data: {
                name: name.trim(),
                emoji,
                subcategoryId: selectedSubcategoryId,
                defaultPaymentMethodType,
                defaultPaymentMethodId: defaultPaymentMethodIdValue,
                budgetMinCents: budgetMinCentsValue,
                budgetMaxCents: budgetMaxCentsValue,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? `Estabelecimento "${name.trim()}" criado.`
            : `Estabelecimento "${name.trim()}" atualizado.`,
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

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEstablishmentAction({ id: defaultValues!.id });
      if (result.success) {
        toast.success(`Estabelecimento "${defaultValues!.name}" removido.`);
        onSuccess?.();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Emoji */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="establishment-emoji">Emoji</Label>
        <Input
          id="establishment-emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📍"
          className="w-20"
          maxLength={10}
        />
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="establishment-name">Nome</Label>
        <Input
          id="establishment-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Pão de Açúcar"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Subcategoria */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="establishment-subcategory">Subcategoria</Label>
        <Select value={selectedSubcategoryId} onValueChange={(val) => setSelectedSubcategoryId(val ?? '')}>
          <SelectTrigger className="w-full" id="establishment-subcategory">
            <SelectValue>
              {selectedSubcategory?.name ?? 'Selecione...'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Metodo de pagamento padrao */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="est-payment-type">Metodo de pagamento padrao</Label>
        <Select
          value={paymentType}
          onValueChange={(val) => {
            if (val) {
              setPaymentType(val as PaymentType);
              setPaymentMethodId('');
            }
          }}
        >
          <SelectTrigger className="w-full" id="est-payment-type">
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
          <Label htmlFor="est-payment-instrument">
            {paymentType === 'credit' ? 'Cartao' : 'Conta'}
          </Label>
          <Select key={paymentType} value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val ?? '')}>
            <SelectTrigger className="w-full" id="est-payment-instrument">
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
          {paymentType === 'credit'
            ? 'Nenhum cartao de credito ativo cadastrado.'
            : 'Nenhuma conta bancaria ativa cadastrada.'}
        </p>
      )}

      {/* Orcamento */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="est-budget-type">Orcamento</Label>
        <Select value={budgetType} onValueChange={(val) => { if (val) setBudgetType(val as BudgetType); }}>
          <SelectTrigger className="w-full" id="est-budget-type">
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

      {budgetType === 'fixed' && (
        <CurrencyInput
          value={budgetMinCents}
          onChange={setBudgetMinCents}
          label="Valor"
          id="est-budget-fixed"
          error={errors.budgetMinCents}
        />
      )}

      {budgetType === 'range' && (
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            value={budgetMinCents}
            onChange={setBudgetMinCents}
            label="Minimo"
            id="est-budget-min"
            error={errors.budgetMinCents}
          />
          <CurrencyInput
            value={budgetMaxCents}
            onChange={setBudgetMaxCents}
            label="Maximo"
            id="est-budget-max"
            error={errors.budgetMaxCents}
          />
        </div>
      )}

      {/* Info de visitas (somente edit) */}
      {mode === 'edit' && defaultValues && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {defaultValues.visitCount > 0
            ? `${defaultValues.visitCount} visita${defaultValues.visitCount > 1 ? 's' : ''}${defaultValues.lastVisitAt ? ` · ultimo uso ${formatLastVisit(defaultValues.lastVisitAt)}` : ''}`
            : 'Nenhuma visita registrada'}
        </div>
      )}

      {/* Botoes */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isPending || name.trim().length === 0 || !selectedSubcategoryId || (paymentType !== 'none' && !paymentMethodId)}
        >
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
        </Button>
      </div>

      {/* Danger zone — excluir (somente edit) */}
      {mode === 'edit' && defaultValues && (
        <div className="border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Excluir estabelecimento
          </Button>
        </div>
      )}
    </form>
  );
}
