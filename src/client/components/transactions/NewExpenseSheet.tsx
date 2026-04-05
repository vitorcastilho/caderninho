'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { CascadeInput } from '@/client/components/ui/cascade-input';
import type {
  CascadeInputData,
  CascadeImpactData,
  Classification,
  Category,
  Subcategory,
  PaymentMethod,
} from '@/client/components/ui/cascade-input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { useIsMobile } from '@/client/hooks/use-is-mobile';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import {
  createTransactionAction,
  getSuggestedEstablishmentsAction,
  getImpactPreviewAction,
} from '@/server/actions/transaction.actions';
import { listEstablishmentsBySubcategoryAction } from '@/server/actions/establishment.actions';

interface NewExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewExpenseSheet({ open, onOpenChange }: NewExpenseSheetProps) {
  const isMobile = useIsMobile();
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [suggestedEstablishments, setSuggestedEstablishments] = useState<string[]>([]);
  const [impactData, setImpactData] = useState<CascadeImpactData | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sheetOpenCount, setSheetOpenCount] = useState(0);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      setSuggestedEstablishments([]);
      setImpactData(null);
      setSheetOpenCount((c) => c + 1);

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
            methods.push({
              id: cc.id,
              label: `${cc.brand} ${cc.name}`,
              type: 'credit',
              brand: cc.brand,
            });
          }
        }

        setPaymentMethods(methods);

        setSubcategories(
          subResult.data
            .filter((s: { status: string }) => s.status === 'active')
            .map((s: { id: string; name: string; categoryId: string; defaultPaymentMethodType?: string | null; defaultPaymentMethodId?: string | null }) => {
              let resolvedPaymentMethodId: string | null = null;
              let paymentLabel: string | null = null;
              let paymentBrand: string | null = null;
              if (s.defaultPaymentMethodType && s.defaultPaymentMethodId) {
                resolvedPaymentMethodId = s.defaultPaymentMethodType === 'pix'
                  ? `pix-${s.defaultPaymentMethodId}`
                  : s.defaultPaymentMethodId;
                const method = methods.find((m) => m.id === resolvedPaymentMethodId);
                paymentLabel = method?.label ?? null;
                paymentBrand = method?.brand ?? null;
              }
              return {
                id: s.id,
                name: s.name,
                categoryId: s.categoryId,
                defaultPaymentMethodId: resolvedPaymentMethodId,
                defaultPaymentMethodLabel: paymentLabel,
                defaultPaymentMethodBrand: paymentBrand,
              };
            }),
        );
      }
    });
  }, [open]);

  const handleSubcategorySelect = useCallback(async (subcategoryId: string) => {
    const [entitiesResult, suggestionsResult] = await Promise.all([
      listEstablishmentsBySubcategoryAction({ subcategoryId }),
      getSuggestedEstablishmentsAction({ subcategoryId }),
    ]);

    const entityNames = entitiesResult.success
      ? entitiesResult.data.map((e: { name: string }) => e.name)
      : [];
    const historyNames = suggestionsResult.success ? suggestionsResult.data : [];

    const uniqueNames = [...new Set([...entityNames, ...historyNames])];
    setSuggestedEstablishments(uniqueNames);
  }, []);

  const handleRequestImpact = useCallback(
    async (data: { amountCents: number; paymentMethodId: string; categoryId: string }) => {
      const method = paymentMethods.find((m) => m.id === data.paymentMethodId);
      if (!method) return;

      const category = categories.find((c) => c.id === data.categoryId);
      if (!category) return;

      let realPaymentMethodId = method.id;
      if (method.type === 'pix') {
        realPaymentMethodId = method.id.replace('pix-', '');
      }

      const result = await getImpactPreviewAction({
        amountCents: data.amountCents,
        paymentMethodType: method.type,
        paymentMethodId: realPaymentMethodId,
        categoryId: data.categoryId,
        categoryName: category.name,
        categoryBudgetCents: category.budget ?? 0,
        paymentMethodLabel: method.label,
      });

      if (result.success) {
        setImpactData(result.data);
      }
    },
    [paymentMethods, categories],
  );

  const handleConfirm = useCallback(
    async (data: CascadeInputData) => {
      setIsSubmitting(true);

      let paymentMethodType: 'debit' | 'credit' | 'pix' = 'debit';
      let paymentMethodId: string | undefined;

      const method = paymentMethods.find((m) => m.id === data.paymentMethodId);
      if (method) {
        paymentMethodType = method.type;
        if (method.type === 'pix') {
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
        toast.error(result.error.message);
      }
    },
    [paymentMethods, onOpenChange],
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        showCloseButton={!isMobile}
        overlayClassName={isMobile ? 'bg-black/45' : undefined}
        className={
          isMobile
            ? 'inset-x-0 bottom-0 h-[85dvh] rounded-t-[20px] border-t-0'
            : 'w-full sm:w-[400px]'
        }
      >
        {/* Handle bar — mobile only */}
        {isMobile && (
          <div className="flex justify-center pt-3">
            <div className="h-1 w-9 rounded-full bg-stone-200" />
          </div>
        )}

        <SheetHeader className={isMobile ? 'flex-row items-center justify-between px-5 py-3' : undefined}>
          <SheetTitle className={isMobile ? 'text-base font-semibold' : undefined}>
            Novo Gasto
          </SheetTitle>
          {isMobile && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-sm text-stone-500 transition-colors hover:bg-stone-200"
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : (
            <CascadeInput
              key={sheetOpenCount}
              classifications={classifications}
              categories={categories}
              subcategories={subcategories}
              suggestedEstablishments={suggestedEstablishments}
              paymentMethods={paymentMethods}
              impactData={impactData}
              isSubmitting={isSubmitting}
              isMobile={isMobile}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onSubcategorySelect={handleSubcategorySelect}
              onRequestImpact={handleRequestImpact}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
