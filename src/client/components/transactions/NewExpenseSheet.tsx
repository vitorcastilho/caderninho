'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

import { CascadeInput } from '@/client/components/ui/cascade-input';
import type { CascadeInputData, CascadeImpactData } from '@/client/components/ui/cascade-input';
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
  getImpactPreviewAction,
} from '@/server/actions/transaction.actions';
import { listEstablishmentsBySubcategoryAction } from '@/server/actions/establishment.actions';

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
  const [impactData, setImpactData] = useState<CascadeImpactData | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // F8: contador para resetar o CascadeInput quando o sheet reabre
  const [sheetOpenCount, setSheetOpenCount] = useState(0);

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      // F8: resetar estado ao reabrir
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
            methods.push({ id: cc.id, label: `${cc.brand} ${cc.name}`, type: 'credit' });
          }
        }

        setPaymentMethods(methods);

        setSubcategories(
          subResult.data
            .filter((s: { status: string }) => s.status === 'active')
            .map((s: { id: string; name: string; categoryId: string; defaultPaymentMethodType?: string | null; defaultPaymentMethodId?: string | null }) => {
              let resolvedPaymentMethodId: string | null = null;
              let paymentLabel: string | null = null;
              if (s.defaultPaymentMethodType && s.defaultPaymentMethodId) {
                // PIX usa ID composto na UI (pix-{bankAccountId}), DB guarda ID cru
                resolvedPaymentMethodId = s.defaultPaymentMethodType === 'pix'
                  ? `pix-${s.defaultPaymentMethodId}`
                  : s.defaultPaymentMethodId;
                const method = methods.find((m) => m.id === resolvedPaymentMethodId);
                paymentLabel = method?.label ?? null;
              }
              return {
                id: s.id,
                name: s.name,
                categoryId: s.categoryId,
                defaultPaymentMethodId: resolvedPaymentMethodId,
                defaultPaymentMethodLabel: paymentLabel,
              };
            }),
        );
      }
    });
  }, [open]);

  // F2: buscar estabelecimentos da entidade + sugestões do histórico ao selecionar subcategoria
  const handleSubcategorySelect = useCallback(async (subcategoryId: string) => {
    const [entitiesResult, suggestionsResult] = await Promise.all([
      listEstablishmentsBySubcategoryAction({ subcategoryId }),
      getSuggestedEstablishmentsAction({ subcategoryId }),
    ]);

    // Priorizar nomes de entidades, complementar com sugestões do histórico
    const entityNames = entitiesResult.success
      ? entitiesResult.data.map((e: { name: string }) => e.name)
      : [];
    const historyNames = suggestionsResult.success ? suggestionsResult.data : [];

    const uniqueNames = [...new Set([...entityNames, ...historyNames])];
    setSuggestedEstablishments(uniqueNames);
  }, []);

  // F3: buscar dados reais de impacto
  const handleRequestImpact = useCallback(
    async (data: { amountCents: number; paymentMethodId: string; categoryId: string }) => {
      const method = paymentMethods.find((m) => m.id === data.paymentMethodId);
      if (!method) return;

      const category = categories.find((c) => c.id === data.categoryId);
      if (!category) return;

      // Resolver id real do método (PIX usa id composto)
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
              key={sheetOpenCount}
              classifications={classifications}
              categories={categories}
              subcategories={subcategories}
              suggestedEstablishments={suggestedEstablishments}
              paymentMethods={paymentMethods}
              impactData={impactData}
              isSubmitting={isSubmitting}
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
