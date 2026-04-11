'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Archive } from 'lucide-react';
import { Button } from '@/client/components/ui/button';
import { Input } from '@/client/components/ui/input';
import { Label } from '@/client/components/ui/label';
import { EmojiPicker } from '@/client/components/ui/emoji-picker';
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
  createSubcategoryAction,
  updateSubcategoryAction,
} from '@/server/actions/subcategory.actions';
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

interface SubcategoryFormProps {
  mode: 'create' | 'edit';
  categoryId?: string;
  defaultValues?: {
    id: string;
    name: string;
    emoji: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  };
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  onSuccess?: () => void;
  onCancel?: () => void;
  onArchive?: () => void;
}

const PAYMENT_TYPE_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: 'none', label: 'Nenhum (usar default da categoria)' },
  ...Object.entries(PAYMENT_METHOD_TYPE_LABELS).map(([value, label]) => ({
    value: value as PaymentMethodType,
    label,
  })),
];

export function SubcategoryForm({
  mode,
  categoryId,
  defaultValues,
  bankAccounts,
  creditCards,
  onSuccess,
  onCancel,
  onArchive,
}: SubcategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(defaultValues?.name ?? '');
  const [emoji, setEmoji] = useState(defaultValues?.emoji ?? '📋');
  const [paymentType, setPaymentType] = useState<PaymentType>(
    (defaultValues?.defaultPaymentMethodType as PaymentMethodType) ?? 'none',
  );
  const [paymentMethodId, setPaymentMethodId] = useState(
    defaultValues?.defaultPaymentMethodId ?? '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeBankAccounts = bankAccounts.filter((a) => a.status === 'active');
  const activeCreditCards = creditCards.filter((c) => c.status === 'active');

  const instrumentOptions: { id: string; label: string; brand?: string; bank?: string }[] = paymentType === 'credit'
    ? activeCreditCards.map((c) => ({ id: c.id, label: c.name, brand: c.brand }))
    : paymentType === 'debit' || paymentType === 'pix'
      ? activeBankAccounts.map((a) => ({ id: a.id, label: `${a.bank} - ${a.name}`, bank: a.bank }))
      : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const defaultPaymentMethodType = paymentType !== 'none' ? paymentType : null;
    const defaultPaymentMethodId = paymentType !== 'none' && paymentMethodId ? paymentMethodId : null;

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createSubcategoryAction({
              name: name.trim(),
              emoji,
              categoryId: categoryId!,
              defaultPaymentMethodType,
              defaultPaymentMethodId,
            })
          : await updateSubcategoryAction({
              id: defaultValues!.id,
              data: {
                name: name.trim(),
                emoji,
                defaultPaymentMethodType,
                defaultPaymentMethodId,
              },
            });

      if (result.success) {
        toast.success(
          mode === 'create'
            ? `Subcategoria "${name.trim()}" criada.`
            : `Subcategoria "${name.trim()}" atualizada.`,
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
      {/* Emoji */}
      <div className="flex flex-col gap-1.5">
        <Label>Emoji</Label>
        <EmojiPicker value={emoji} onChange={setEmoji} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subcategory-name">Nome</Label>
        <Input
          id="subcategory-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Aluguel"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Método de pagamento override */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="subcategory-payment-type">Método de pagamento padrão</Label>
        <Select
          value={paymentType}
          onValueChange={(val) => {
            if (val) {
              setPaymentType(val as PaymentType);
              setPaymentMethodId('');
            }
          }}
        >
          <SelectTrigger className="w-full" id="subcategory-payment-type">
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
        <p className="text-xs text-muted-foreground">
          Se configurado, sobrescreve o padrão da categoria pai.
        </p>
      </div>

      {paymentType !== 'none' && instrumentOptions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subcategory-payment-instrument">
            {paymentType === 'credit' ? 'Cartão' : 'Conta'}
          </Label>
          <Select key={paymentType} value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val ?? '')}>
            <SelectTrigger className="w-full" id="subcategory-payment-instrument">
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

      {/* AÇÕES — somente em edit mode */}
      {mode === 'edit' && onArchive && (
        <div className="border-t border-destructive/30 pt-4 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">Ações</p>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-card border border-border p-3 text-left transition-colors hover:bg-muted/50"
            onClick={onArchive}
          >
            <Archive className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Arquivar</p>
              <p className="text-xs text-muted-foreground">Oculta da listagem principal, preserva o histórico</p>
            </div>
          </button>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending || name.trim().length === 0 || (paymentType !== 'none' && !paymentMethodId)}>
          {isPending ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
