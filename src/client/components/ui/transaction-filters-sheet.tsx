'use client';

import { useEffect, useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { Button } from '@/client/components/ui/button';
import { BankLogo } from '@/client/components/ui/bank-logo';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import { cn } from '@/client/utils/utils';

export interface TransactionFilterCategory {
  id: string;
  name: string;
  emoji?: string;
}

export interface TransactionFilterPaymentMethod {
  id: string;
  label: string;
  bankName?: string;
  cardBrand?: string;
}

export interface TransactionFiltersSelection {
  categoryIds: Set<string>;
  paymentMethodIds: Set<string>;
}

export interface TransactionFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  categories: TransactionFilterCategory[];
  paymentMethods: TransactionFilterPaymentMethod[];

  selectedCategoryIds: Set<string>;
  selectedPaymentMethodIds: Set<string>;

  onApply: (selection: TransactionFiltersSelection) => void;
}

function toggleInSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function TransactionFiltersSheet({
  open,
  onOpenChange,
  categories,
  paymentMethods,
  selectedCategoryIds,
  selectedPaymentMethodIds,
  onApply,
}: TransactionFiltersSheetProps) {
  const [localCategoryIds, setLocalCategoryIds] = useState<Set<string>>(
    () => new Set(selectedCategoryIds),
  );
  const [localPaymentMethodIds, setLocalPaymentMethodIds] = useState<Set<string>>(
    () => new Set(selectedPaymentMethodIds),
  );

  // Sync local state with props only when the sheet opens
  // (ignore prop updates while closed to avoid stale-state issues).
  useEffect(() => {
    if (open) {
      setLocalCategoryIds(new Set(selectedCategoryIds));
      setLocalPaymentMethodIds(new Set(selectedPaymentMethodIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClear = () => {
    setLocalCategoryIds(new Set());
    setLocalPaymentMethodIds(new Set());
  };

  const handleApply = () => {
    onApply({
      categoryIds: new Set(localCategoryIds),
      paymentMethodIds: new Set(localPaymentMethodIds),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[360px] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto px-4"
          data-slot="transaction-filters-sheet-body"
        >
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Categoria
            </h3>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhuma categoria disponível.
              </p>
            ) : (
              <ul data-slot="transaction-filters-sheet-categories">
                {categories.map((cat) => {
                  const checked = localCategoryIds.has(cat.id);
                  return (
                    <li key={cat.id}>
                      <label
                        className={cn(
                          'flex items-center gap-2.5 py-2 cursor-pointer rounded-md px-1',
                          'hover:bg-muted/30',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setLocalCategoryIds((prev) =>
                              toggleInSet(prev, cat.id),
                            )
                          }
                          className="size-4 rounded border-border accent-primary"
                          aria-label={cat.name}
                        />
                        {cat.emoji && (
                          <span className="text-base leading-none">{cat.emoji}</span>
                        )}
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Método de pagamento
            </h3>
            {paymentMethods.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum método disponível.
              </p>
            ) : (
              <ul data-slot="transaction-filters-sheet-payment-methods">
                {paymentMethods.map((pm) => {
                  const checked = localPaymentMethodIds.has(pm.id);
                  return (
                    <li key={pm.id}>
                      <label
                        className={cn(
                          'flex items-center gap-2.5 py-2 cursor-pointer rounded-md px-1',
                          'hover:bg-muted/30',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setLocalPaymentMethodIds((prev) =>
                              toggleInSet(prev, pm.id),
                            )
                          }
                          className="size-4 rounded border-border accent-primary"
                          aria-label={pm.label}
                        />
                        {pm.bankName && <BankLogo bank={pm.bankName} size="sm" />}
                        {pm.cardBrand && (
                          <CreditCardBrandBadge brand={pm.cardBrand} />
                        )}
                        <span className="text-sm">{pm.label}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
            data-slot="transaction-filters-sheet-clear"
          >
            Limpar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1"
            data-slot="transaction-filters-sheet-apply"
          >
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
