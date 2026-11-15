'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Trash2 } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { EmojiPicker } from '@/client/components/ui/emoji-picker';
import { CurrencyInput } from '@/client/components/ui/currency-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/client/components/ui/select';
import { BankLogo } from '@/client/components/ui/bank-logo';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import {
  createEstablishmentAction,
  updateEstablishmentAction,
  deleteEstablishmentAction,
} from '@/client/actions/establishment.actions';
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
  const [budgetMinCents, setBudgetMinCents] = useState(defaultValues?.budgetMinCents ?? 0);
  const [budgetMaxCents, setBudgetMaxCents] = useState(defaultValues?.budgetMaxCents ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeBankAccounts = bankAccounts.filter((a) => a.status === 'active');
  const activeCreditCards = creditCards.filter((c) => c.status === 'active');

  const instrumentOptions: { id: string; label: string; brand?: string; bank?: string }[] = paymentType === 'credit'
    ? activeCreditCards.map((c) => ({ id: c.id, label: c.name, brand: c.brand }))
    : paymentType === 'debit' || paymentType === 'pix'
      ? activeBankAccounts.map((a) => ({ id: a.id, label: `${a.bank} - ${a.name}`, bank: a.bank }))
      : [];

  const selectedSubcategory = subcategories.find((s) => s.id === selectedSubcategoryId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const budgetMinCentsValue = budgetMinCents > 0 ? budgetMinCents : null;
    const budgetMaxCentsValue = budgetMaxCents > 0 ? budgetMaxCents : null;

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
        <Label>Emoji</Label>
        <EmojiPicker value={emoji} onChange={setEmoji} />
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

      {/* Método de pagamento padrão */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="est-payment-type">
          Método de pagamento padrão{' '}
          <span className="font-normal text-muted-foreground">(aprendido do uso)</span>
        </Label>
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
            {paymentType === 'credit' ? 'Cartão' : 'Conta'}
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
                  if (selected.bank) {
                    return (
                      <span className="inline-flex items-center gap-1.5">
                        <BankLogo bank={selected.bank} size="sm" />
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
                  ) : opt.bank ? (
                    <span className="inline-flex items-center gap-1.5">
                      <BankLogo bank={opt.bank} size="sm" />
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
            ? 'Nenhum cartão de crédito ativo cadastrado.'
            : 'Nenhuma conta bancária ativa cadastrada.'}
        </p>
      )}

      {/* Orçamento mensal */}
      <div className="flex flex-col gap-1.5">
        <Label>
          Orçamento mensal{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput
            value={budgetMinCents}
            onChange={setBudgetMinCents}
            label="Mínimo"
            id="est-budget-min"
            error={errors.budgetMinCents}
          />
          <CurrencyInput
            value={budgetMaxCents}
            onChange={setBudgetMaxCents}
            label="Máximo"
            id="est-budget-max"
            error={errors.budgetMaxCents}
          />
        </div>
      </div>

      {/* Info de visitas (somente edit) */}
      {mode === 'edit' && defaultValues && (
        <div className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          {defaultValues.visitCount > 0
            ? `${defaultValues.visitCount} visita${defaultValues.visitCount > 1 ? 's' : ''}${defaultValues.lastVisitAt ? ` · último uso ${formatLastVisit(defaultValues.lastVisitAt)}` : ''}`
            : 'Nenhuma visita registrada'}
        </div>
      )}

      {/* AÇÕES — somente em edit mode */}
      {mode === 'edit' && defaultValues && (
        <div className="border-t border-destructive/30 pt-4 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">Ações</p>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-card border border-border p-3 text-left transition-colors hover:bg-muted/50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Excluir</p>
              <p className="text-xs text-muted-foreground">Remove o estabelecimento — o histórico de transações é mantido</p>
            </div>
          </button>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="rounded-card border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm text-destructive font-medium mb-2">Confirmar exclusão?</p>
          <p className="text-xs text-muted-foreground mb-3">
            O estabelecimento &ldquo;{defaultValues?.name}&rdquo; será removido permanentemente.
          </p>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Excluindo...' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}

      {/* Botões */}
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
    </form>
  );
}
