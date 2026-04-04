'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { CascadeInput } from '@/client/components/ui/cascade-input';
import type { CascadeInputData } from '@/client/components/ui/cascade-input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import {
  createTransactionAction,
  getSuggestedEstablishmentsAction,
} from '@/server/actions/transaction.actions';

interface Classification {
  id: string;
  name: string;
  emoji: string;
}

interface Category {
  id: string;
  name: string;
  classificationId: string;
  budget?: number;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodId?: string | null;
  defaultPaymentMethodLabel?: string | null;
}

interface PaymentMethod {
  id: string;
  label: string;
  type: 'debit' | 'credit' | 'pix';
}

interface NewExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewExpenseSheet({ open, onOpenChange }: NewExpenseSheetProps) {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [suggestedEstablishments, setSuggestedEstablishments] = useState<string[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      const [classResult, catResult, subResult, bankResult, ccResult] = await Promise.all([
        listClassificationsAction(undefined),
        listCategoriesAction(undefined),
        listSubcategoriesAction(undefined),
        listBankAccountsAction(undefined),
        listCreditCardsAction(undefined),
      ]);

      if (classResult.success) {
        setClassifications(
          classResult.data
            .filter((c: { status: string }) => c.status === 'active')
            .map((c: { id: string; name: string; emoji?: string }) => ({
              id: c.id,
              name: c.name,
              emoji: c.emoji ?? '📊',
            })),
        );
      }

      if (catResult.success) {
        setCategories(
          catResult.data
            .filter((c: { status: string }) => c.status === 'active')
            .map((c: { id: string; name: string; classificationId: string; budgetMaxCents?: number | null }) => ({
              id: c.id,
              name: c.name,
              classificationId: c.classificationId,
              budget: c.budgetMaxCents ?? undefined,
            })),
        );
      }

      if (subResult.success) {
        const methods: PaymentMethod[] = [];

        if (bankResult.success) {
          for (const acc of bankResult.data.filter((a: { status: string }) => a.status === 'active')) {
            methods.push({ id: acc.id, label: `${acc.bank} - ${acc.name}`, type: 'debit' });
            methods.push({ id: `pix-${acc.id}`, label: `PIX ${acc.bank}`, type: 'pix' });
          }
        }

        if (ccResult.success) {
          for (const cc of ccResult.data.filter((c: { status: string }) => c.status === 'active')) {
            methods.push({ id: cc.id, label: `${cc.brand} ${cc.name}`, type: 'credit' });
          }
        }

        setPaymentMethods(methods);

        setSubcategories(
          subResult.data
            .filter((s: { status: string }) => s.status === 'active')
            .map((s: { id: string; name: string; categoryId: string; defaultPaymentMethodType?: string | null; defaultPaymentMethodId?: string | null }) => {
              let paymentLabel: string | null = null;
              if (s.defaultPaymentMethodId) {
                const method = methods.find((m) => m.id === s.defaultPaymentMethodId);
                paymentLabel = method?.label ?? null;
              }
              return {
                id: s.id,
                name: s.name,
                categoryId: s.categoryId,
                defaultPaymentMethodId: s.defaultPaymentMethodId ?? null,
                defaultPaymentMethodLabel: paymentLabel,
              };
            }),
        );
      }
    });
  }, [open]);

  const handleConfirm = useCallback(
    async (data: CascadeInputData) => {
      setIsSubmitting(true);

      // Resolver o tipo e id real do método de pagamento
      let paymentMethodType: 'debit' | 'credit' | 'pix' = 'debit';
      let paymentMethodId: string | undefined;

      const method = paymentMethods.find((m) => m.id === data.paymentMethodId);
      if (method) {
        paymentMethodType = method.type;
        if (method.type === 'pix') {
          // PIX ids são "pix-{bankAccountId}"
          paymentMethodId = method.id.replace('pix-', '');
        } else {
          paymentMethodId = method.id;
        }
      }

      const result = await createTransactionAction({
        amountCents: data.valueCents,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || undefined,
        establishment: data.establishment || undefined,
        paymentMethodType,
        paymentMethodId,
      });

      setIsSubmitting(false);

      if (result.success) {
        onOpenChange(false);
        toast.success('Gasto registrado!', {
          action: {
            label: 'Desfazer',
            onClick: () => {
              // TODO: implementar undo em Story 3.3
            },
          },
          duration: 5000,
        });
      } else {
        toast.error(result.error.message, {
          action: {
            label: 'Tentar novamente',
            onClick: () => handleConfirm(data),
          },
        });
      }
    },
    [paymentMethods, onOpenChange],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton className="w-full sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Novo Gasto</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <CascadeInput
              classifications={classifications}
              categories={categories}
              subcategories={subcategories}
              suggestedEstablishments={suggestedEstablishments}
              paymentMethods={paymentMethods}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
