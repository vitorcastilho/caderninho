'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Plus, Pencil } from 'lucide-react';
import { cn } from '@/client/utils/utils';

import { BankLogo } from '@/client/components/ui/bank-logo';
import { BudgetProgressBar, getLabelColorClass, getRemainderLabel } from '@/client/components/ui/budget-progress-bar';
import { Button } from '@/client/components/ui/button';
import { CreditCardBrandBadge } from '@/client/components/ui/credit-card-brand-badge';
import { formatCurrency } from '@/client/utils/format-currency';
import {
  reactivateCategoryAction,
} from '@/client/actions/category.actions';
import {
  reactivateSubcategoryAction,
} from '@/client/actions/subcategory.actions';
import { EstablishmentRow } from './EstablishmentRow';

interface Category {
  id: string;
  name: string;
  emoji: string;
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
  emoji: string;
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
  spendingByCategory?: Map<string, number>;
  spendingBySubcategory?: Map<string, number>;
  spendingByEstablishment?: Map<string, number>;
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
  spendingByCategory,
  spendingBySubcategory,
  spendingByEstablishment,
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
  const categorySpent = spendingByCategory?.get(category.id) ?? 0;
  const categoryBudgetMax = category.budgetMaxCents ?? category.budgetMinCents ?? 0;
  const paymentMethodDisplay = resolvePaymentMethodDisplay(
    category.defaultPaymentMethodType,
    category.defaultPaymentMethodId,
    bankAccounts,
    creditCards,
  );

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
        className={cn(
          'group/cat flex w-full cursor-pointer items-center gap-2 bg-muted/30 px-4 py-2.5 pl-10 text-left transition-colors hover:bg-muted/60',
          'border-l-4',
          expanded ? 'border-l-primary' : 'border-l-primary/30'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Recolher' : 'Expandir'} ${category.name}`}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
              !expanded && '-rotate-90'
            )}
          />
        </button>
        <span className="shrink-0 text-sm">{category.emoji}</span>
        <div className="flex min-w-0 flex-shrink-0 flex-col">
          <span className="text-sm font-medium">{category.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {totalSubs} {totalSubs === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {categoryBudgetMax > 0 && (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              <strong className="font-semibold text-foreground">{formatCurrency(categorySpent)}</strong>
              {' '}/ {budgetDisplay}
            </span>
            <BudgetProgressBar
              spent={categorySpent}
              budget={categoryBudgetMax}
              variant="mini"
            />
            {(() => {
              const pct = Math.round((categorySpent / categoryBudgetMax) * 100);
              return (
                <span className={cn('text-[11px] tabular-nums', getLabelColorClass(pct))}>
                  {getRemainderLabel(categorySpent, categoryBudgetMax, pct)}
                </span>
              );
            })()}
          </div>
        )}

        {categoryBudgetMax === 0 && categorySpent > 0 && (
          <span className="flex-1 text-xs tabular-nums text-muted-foreground">
            <strong className="font-semibold text-foreground">{formatCurrency(categorySpent)}</strong>
            {' '}<span className="text-muted-foreground">(sem orç.)</span>
          </span>
        )}

        {categoryBudgetMax === 0 && categorySpent === 0 && budgetDisplay && (
          <span className="flex-1 text-xs text-muted-foreground tabular-nums">
            {budgetDisplay}
          </span>
        )}

        {paymentMethodDisplay && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {paymentMethodDisplay}
          </span>
        )}

        <div
          className="flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {category.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={onAddSubcategory}
                title="Adicionar subcategoria"
                aria-label={`Adicionar subcategoria em ${category.name}`}
              >
                <Plus className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={onEdit}
                title="Editar categoria"
                aria-label={`Editar categoria ${category.name}`}
              >
                <Pencil className="size-3.5" />
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
            const subSpent = spendingBySubcategory?.get(sub.id) ?? 0;
            // Subcategories mostram % relativo ao budget da categoria pai (quando existe), senão ao gasto total
            const subDenominator = categoryBudgetMax > 0 ? categoryBudgetMax : categorySpent;
            const subPercentOfParent = subDenominator > 0
              ? `${Math.round((subSpent / subDenominator) * 100)}% de ${category.name}`
              : '';
            return (
            <div key={sub.id}>
              <div
                className={cn(
                  'group/sub flex cursor-pointer items-center gap-3 border-b border-border bg-card py-3 pr-4 pl-16 transition-colors hover:bg-muted/30',
                  'border-l-4',
                  isSubExpanded ? 'border-l-muted-foreground/40' : 'border-l-border'
                )}
                onClick={() => toggleSubExpand(sub.id)}
              >
                <button
                  type="button"
                  aria-expanded={isSubExpanded}
                  aria-label={`${isSubExpanded ? 'Recolher' : 'Expandir'} ${sub.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubExpand(sub.id);
                  }}
                  className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      'size-3.5 shrink-0 text-muted-foreground transition-transform duration-150',
                      !isSubExpanded && '-rotate-90'
                    )}
                  />
                </button>
                <span className="shrink-0 text-sm">{sub.emoji}</span>
                <div className="flex min-w-0 flex-shrink-0 flex-col">
                  <span className="text-sm">{sub.name}</span>
                  {subPaymentDisplay && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground w-fit mt-0.5">
                      {subPaymentDisplay}
                    </span>
                  )}
                </div>

                {subSpent > 0 && (
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      <strong className="font-semibold text-foreground">{formatCurrency(subSpent)}</strong>
                      {categoryBudgetMax > 0 && ` / ${budgetDisplay}`}
                      {categoryBudgetMax === 0 && ' (sem orç.)'}
                    </span>
                    <BudgetProgressBar
                      spent={subSpent}
                      budget={categoryBudgetMax > 0 ? categoryBudgetMax : categorySpent}
                      variant="mini"
                      className="h-1"
                    />
                    {subPercentOfParent && (
                      <span className="text-[11px] tabular-nums text-muted-foreground">
                        {subPercentOfParent}
                      </span>
                    )}
                  </div>
                )}

                {subSpent === 0 && subEstablishments.length > 0 && (
                  <span className="flex-1 text-xs text-muted-foreground">
                    {subEstablishments.length}{' '}
                    {subEstablishments.length === 1 ? 'estabelecimento' : 'estabelecimentos'}
                  </span>
                )}

                <div
                  className="flex gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onAddEstablishment(sub.id)}
                    title="Adicionar estabelecimento"
                    aria-label={`Adicionar estabelecimento em ${sub.name}`}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-xs"
                    onClick={() => onEditSubcategory(sub)}
                    title="Editar subcategoria"
                    aria-label={`Editar subcategoria ${sub.name}`}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              </div>
              {isSubExpanded && subEstablishments.map((est) => (
                <EstablishmentRow
                  key={est.id}
                  establishment={est}
                  subcategoryName={sub.name}
                  spendingByEstablishment={spendingByEstablishment}
                  subcategorySpent={subSpent}
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
                        className="h-6 text-xs"
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
