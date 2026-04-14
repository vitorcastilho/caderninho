'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
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
import { useIsMobile } from '@/client/hooks/use-is-mobile';
import { updateExpenseTransactionAction } from '@/server/actions/transaction.actions';
import type {
  TransactionDTO,
  CategoryOption,
  SubcategoryOption,
  BankAccountOption,
  CreditCardOption,
} from './TransactionList';

type PaymentMethodType = 'debit' | 'credit' | 'pix';

interface EditExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDTO | null;
  categories: CategoryOption[];
  subcategories: SubcategoryOption[];
  bankAccounts: BankAccountOption[];
  creditCards: CreditCardOption[];
  onSaved?: () => void;
}

export function EditExpenseSheet({
  open,
  onOpenChange,
  transaction,
  categories,
  subcategories,
  bankAccounts,
  creditCards,
  onSaved,
}: EditExpenseSheetProps) {
  const isMobile = useIsMobile();
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [amountCents, setAmountCents] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);
  const [establishment, setEstablishment] = useState('');
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethodType>('debit');
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (transaction && transaction.id !== loadedId) {
    setLoadedId(transaction.id);
    setAmountCents(transaction.amountCents);
    setCategoryId(transaction.categoryId);
    setSubcategoryId(transaction.subcategoryId);
    setEstablishment(transaction.establishment ?? '');
    setPaymentMethodType(
      (transaction.paymentMethodType as PaymentMethodType | null) ?? 'debit',
    );
    setPaymentMethodId(transaction.paymentMethodId);
    setDescription(transaction.description ?? '');
  }

  const activeCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );

  const filteredSubcategories = useMemo(
    () => subcategories.filter((s) => s.categoryId === categoryId),
    [subcategories, categoryId],
  );

  const activeBankAccounts = useMemo(
    () => bankAccounts.filter((a) => a.status === 'active'),
    [bankAccounts],
  );

  const activeCreditCards = useMemo(
    () => creditCards.filter((c) => c.status === 'active'),
    [creditCards],
  );

  const isCardMethod = paymentMethodType === 'credit';

  const canSubmit =
    !!transaction && amountCents > 0 && !!categoryId && !!paymentMethodId && !isSubmitting;

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleConfirm = useCallback(async () => {
    if (!transaction || !canSubmit || !categoryId) return;

    setIsSubmitting(true);
    const result = await updateExpenseTransactionAction({
      id: transaction.id,
      amountCents,
      categoryId,
      subcategoryId: subcategoryId || undefined,
      establishment: establishment.trim() || undefined,
      paymentMethodType,
      paymentMethodId: paymentMethodId || undefined,
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      onOpenChange(false);
      toast.success('Alteração salva.');
      onSaved?.();
    } else {
      toast.error(result.error.message);
    }
  }, [
    transaction,
    canSubmit,
    amountCents,
    categoryId,
    subcategoryId,
    establishment,
    paymentMethodType,
    paymentMethodId,
    description,
    onOpenChange,
    onSaved,
  ]);

  const formBody = (
    <div className="flex flex-1 flex-col gap-4 px-5 pt-2 pb-5 overflow-y-auto">
      <CurrencyInput
        id="edit-expense-amount"
        label="Valor"
        value={amountCents}
        onChange={setAmountCents}
        disabled={isSubmitting}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-expense-category">Categoria</Label>
        <Select
          value={categoryId ?? ''}
          onValueChange={(value) => {
            setCategoryId(value || null);
            setSubcategoryId(null);
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger id="edit-expense-category" className="w-full">
            <SelectValue>
              {activeCategories.find((c) => c.id === categoryId)?.name ?? 'Selecionar categoria'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {activeCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredSubcategories.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-expense-subcategory">Subcategoria (opcional)</Label>
          <Select
            value={subcategoryId ?? ''}
            onValueChange={(value) => setSubcategoryId(value || null)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="edit-expense-subcategory" className="w-full">
              <SelectValue>
                {filteredSubcategories.find((s) => s.id === subcategoryId)?.name ?? 'Selecionar'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredSubcategories.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-expense-establishment">Estabelecimento (opcional)</Label>
        <Input
          id="edit-expense-establishment"
          value={establishment}
          onChange={(e) => setEstablishment(e.target.value)}
          placeholder="Ex: Mercado"
          maxLength={200}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Método de pagamento</Label>
        <div className="flex gap-1 rounded-md border border-input p-0.5">
          {(['debit', 'credit', 'pix'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setPaymentMethodType(type);
                setPaymentMethodId(null);
              }}
              disabled={isSubmitting}
              className={
                'flex-1 rounded px-2 py-1.5 text-xs font-medium transition-colors ' +
                (paymentMethodType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted')
              }
            >
              {type === 'debit' ? 'Débito' : type === 'credit' ? 'Crédito' : 'PIX'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-expense-method">
          {isCardMethod ? 'Cartão' : 'Conta'}
        </Label>
        <Select
          value={paymentMethodId ?? ''}
          onValueChange={(value) => setPaymentMethodId(value || null)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="edit-expense-method" className="w-full">
            <SelectValue>
              {isCardMethod
                ? activeCreditCards.find((c) => c.id === paymentMethodId)?.name ??
                  'Selecionar cartão'
                : activeBankAccounts.find((a) => a.id === paymentMethodId)
                  ? `${activeBankAccounts.find((a) => a.id === paymentMethodId)!.bank} - ${activeBankAccounts.find((a) => a.id === paymentMethodId)!.name}`
                  : 'Selecionar conta'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {isCardMethod
              ? activeCreditCards.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.brand} {c.name}
                  </SelectItem>
                ))
              : activeBankAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.bank} - {a.name}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-expense-description">Descrição (opcional)</Label>
        <Input
          id="edit-expense-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Mercado da semana"
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>

      {/* TODO: preview de delta — Epic 6. ImpactPreview existente é para criação (mostra saldo/budget pós-criar); para edição precisaríamos calcular o delta (reverter antigo, aplicar novo). Adiado para escopo desta story. */}

      <div className="mt-auto flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleConfirm}
          disabled={!canSubmit}
        >
          {isSubmitting ? 'Salvando…' : 'Confirmar alteração'}
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={!isMobile}
        overlayClassName={isMobile ? 'bg-black/45' : undefined}
        className={
          isMobile
            ? 'inset-x-0 bottom-0 gap-0 rounded-t-[20px] border-t-0 p-0 data-[side=bottom]:h-[85dvh]'
            : 'w-[420px] data-[side=right]:sm:max-w-[420px]'
        }
      >
        {isMobile ? (
          <>
            <div className="flex justify-center pt-3">
              <div className="h-1 w-9 rounded-full bg-stone-200" />
            </div>
            <SheetHeader className="flex-row items-center justify-between px-5 py-3">
              <SheetTitle className="text-base font-semibold">Editar gasto</SheetTitle>
              <button
                type="button"
                onClick={handleCancel}
                className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-500 transition-colors hover:bg-stone-200"
                aria-label="Fechar"
              >
                ✕
              </button>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col">{formBody}</div>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Editar gasto</SheetTitle>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col">{formBody}</div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
