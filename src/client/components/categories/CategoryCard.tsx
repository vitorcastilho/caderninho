'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/client/utils/utils';

import { BankLogo } from '@/client/components/ui/bank-logo';
import { Button } from '@/client/components/ui/button';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/client/components/ui/dialog';
import { formatCurrency } from '@/client/utils/format-currency';
import {
  archiveCategoryAction,
  reactivateCategoryAction,
} from '@/server/actions/category.actions';
import {
  archiveSubcategoryAction,
  reactivateSubcategoryAction,
} from '@/server/actions/subcategory.actions';
import { EstablishmentRow } from './EstablishmentRow';

interface Category {
  id: string;
  name: string;
  classificationId: string;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  status: 'active' | 'archived';
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  status: 'active' | 'archived';
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

interface Establishment {
  id: string;
  name: string;
  emoji: string;
  subcategoryId: string;
  source: 'auto' | 'manual';
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  visitCount: number;
  lastVisitAt: string | null;
  status: 'active' | 'archived';
}

interface CategoryCardProps {
  category: Category;
  subcategories: Subcategory[];
  establishments: Establishment[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  onEdit: () => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onAddEstablishment: (subcategoryId: string) => void;
  onEditEstablishment: (establishment: Establishment) => void;
  onStatusChange: () => void;
}

function formatBudget(minCents: number | null, maxCents: number | null): string | null {
  if (minCents == null) return null;
  if (maxCents == null || maxCents === minCents) return formatCurrency(minCents);
  return `${formatCurrency(minCents)} — ${formatCurrency(maxCents)}`;
}

function resolvePaymentMethodDisplay(
  type: string | null,
  id: string | null,
  bankAccounts: BankAccount[],
  creditCards: CreditCard[],
): React.ReactNode | null {
  if (!type || !id) return null;
  if (type === 'credit') {
    const card = creditCards.find((c) => c.id === id);
    if (!card) return null;
    return (
      <span className="inline-flex items-center gap-1">
        <CreditCardBrandBadge brand={card.brand} />
        <span>{card.name}</span>
      </span>
    );
  }
  const account = bankAccounts.find((a) => a.id === id);
  if (!account) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <BankLogo bank={account.bank} size="sm" />
      <span>{account.bank} - {type === 'debit' ? 'Débito' : 'Pix'}</span>
    </span>
  );
}

export function CategoryCard({
  category,
  subcategories,
  establishments,
  bankAccounts,
  creditCards,
  onEdit,
  onAddSubcategory,
  onEditSubcategory,
  onAddEstablishment,
  onEditEstablishment,
  onStatusChange,
}: CategoryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleSubExpand(subId: string) {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) next.delete(subId);
      else next.add(subId);
      return next;
    });
  }

  const activeSubcategories = subcategories.filter((s) => s.status === 'active');
  const archivedSubcategories = subcategories.filter((s) => s.status === 'archived');
  const [showArchivedSubs, setShowArchivedSubs] = useState(false);
  const totalSubs = activeSubcategories.length + archivedSubcategories.length;

  const budgetDisplay = formatBudget(category.budgetMinCents, category.budgetMaxCents);
  const paymentMethodDisplay = resolvePaymentMethodDisplay(
    category.defaultPaymentMethodType,
    category.defaultPaymentMethodId,
    bankAccounts,
    creditCards,
  );

  function handleArchiveCategory() {
    startTransition(async () => {
      const result = await archiveCategoryAction({ id: category.id });
      if (result.success) {
        toast.success(`Categoria "${category.name}" arquivada.`);
        setShowArchiveDialog(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivateCategory() {
    startTransition(async () => {
      const result = await reactivateCategoryAction({ id: category.id });
      if (result.success) {
        toast.success(`Categoria "${category.name}" reativada.`);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleArchiveSubcategory(sub: Subcategory) {
    startTransition(async () => {
      const result = await archiveSubcategoryAction({ id: sub.id });
      if (result.success) {
        toast.success(`Subcategoria "${sub.name}" arquivada.`);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleReactivateSubcategory(sub: Subcategory) {
    startTransition(async () => {
      const result = await reactivateSubcategoryAction({ id: sub.id });
      if (result.success) {
        toast.success(`Subcategoria "${sub.name}" reativada.`);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Category header — Level 2 do padrão "Lista Colapsável" do DS */}
      <div
        className="group/cat flex w-full cursor-pointer items-center gap-2 bg-muted/30 px-4 py-2.5 pl-10 text-left transition-colors hover:bg-muted/60"
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
            !expanded && '-rotate-90'
          )}
        />
        <span className="flex-1 text-sm font-medium">{category.name}</span>

        {budgetDisplay && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {budgetDisplay}
          </span>
        )}

        {paymentMethodDisplay && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {paymentMethodDisplay}
          </span>
        )}

        {totalSubs > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalSubs} {totalSubs === 1 ? 'item' : 'itens'}
          </span>
        )}

        <div
          className="flex gap-1 opacity-0 transition-opacity group-hover/cat:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {category.status === 'active' && (
            <>
              <Button variant="ghost" size="xs" onClick={onAddSubcategory}>
                + Sub
              </Button>
              <Button variant="ghost" size="xs" onClick={onEdit}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowArchiveDialog(true)}
              >
                Arquivar
              </Button>
            </>
          )}
          {category.status === 'archived' && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReactivateCategory}
              disabled={isPending}
            >
              {isPending ? 'Reativando...' : 'Reativar'}
            </Button>
          )}
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar categoria</DialogTitle>
            <DialogDescription>
              A categoria &ldquo;{category.name}&rdquo; será arquivada. Ela poderá ser reativada
              depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={handleArchiveCategory} disabled={isPending}>
              {isPending ? 'Arquivando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategories — Level 3 do padrão "Lista Colapsável" do DS */}
      {expanded && (
        <>
          {activeSubcategories.map((sub) => {
            const subPaymentDisplay = resolvePaymentMethodDisplay(
              sub.defaultPaymentMethodType,
              sub.defaultPaymentMethodId,
              bankAccounts,
              creditCards,
            );
            const subEstablishments = establishments.filter(
              (e) => e.subcategoryId === sub.id && e.status === 'active',
            );
            const isSubExpanded = expandedSubs.has(sub.id);
            return (
            <div key={sub.id}>
              <div
                className="group/sub flex cursor-pointer items-center gap-3 border-b border-border bg-card py-3 pr-4 pl-10 transition-colors hover:bg-muted/30"
                onClick={() => toggleSubExpand(sub.id)}
              >
                <ChevronDown
                  className={cn(
                    'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
                    !isSubExpanded && '-rotate-90'
                  )}
                />
                <span className="flex-1 text-sm">{sub.name}</span>
                {subPaymentDisplay && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {subPaymentDisplay}
                  </span>
                )}
                {subEstablishments.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {subEstablishments.length} estab.
                  </span>
                )}
                <div
                  className="flex gap-1 opacity-0 transition-opacity group-hover/sub:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 text-xs"
                    onClick={() => onAddEstablishment(sub.id)}
                  >
                    + Estab
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 text-xs"
                    onClick={() => onEditSubcategory(sub)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-6 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleArchiveSubcategory(sub)}
                    disabled={isPending}
                  >
                    Arquivar
                  </Button>
                </div>
              </div>
              {isSubExpanded && subEstablishments.map((est) => (
                <EstablishmentRow
                  key={est.id}
                  establishment={est}
                  onEdit={onEditEstablishment}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
            );
          })}

          {archivedSubcategories.length > 0 && (
            <div className="border-b border-border px-4 py-2 pl-16 last:border-b-0">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => setShowArchivedSubs(!showArchivedSubs)}
              >
                {showArchivedSubs
                  ? 'Ocultar'
                  : `+${archivedSubcategories.length} arquivada${archivedSubcategories.length > 1 ? 's' : ''}`}
              </Button>
              {showArchivedSubs && (
                <div className="mt-1 opacity-60">
                  {archivedSubcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="group/sub flex items-center gap-3 py-2"
                    >
                      <div className="size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                      <span className="flex-1 text-sm text-muted-foreground">{sub.name}</span>
                      <Button
                        variant="ghost"
                        size="xs"
                        className="h-6 text-xs opacity-0 group-hover/sub:opacity-100 transition-opacity"
                        onClick={() => handleReactivateSubcategory(sub)}
                        disabled={isPending}
                      >
                        Reativar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
