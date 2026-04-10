'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Plus, Pencil } from 'lucide-react';
import { cn } from '@/client/utils/utils';

import { Button } from '@/client/components/ui/button';
import { BudgetProgressBar } from '@/client/components/ui/budget-progress-bar';
import { CategoryCard } from './CategoryCard';
import { formatCurrency } from '@/client/utils/format-currency';
import {
  reactivateClassificationAction,
} from '@/server/actions/classification.actions';

interface Classification {
  id: string;
  name: string;
  displayOrder: number;
  status: 'active' | 'archived';
  activeCategoryCount: number;
}

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

interface ClassificationSectionProps {
  classification: Classification;
  categories: Category[];
  subcategoriesByCategory: Map<string, Subcategory[]>;
  establishments: Establishment[];
  spendingByCategory?: Map<string, number>;
  spendingBySubcategory?: Map<string, number>;
  spendingByEstablishment?: Map<string, number>;
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  onEditClassification: (classification: Classification) => void;
  onAddCategory: (classificationId: string) => void;
  onEditCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onAddEstablishment: (subcategoryId: string) => void;
  onEditEstablishment: (establishment: Establishment) => void;
  onStatusChange: () => void;
}

const CLASSIFICATION_HINTS: Record<string, string> = {
  'Essenciais': 'Ex: Moradia, Alimentação, Transporte, Saúde...',
  'Qualidade de Vida': 'Ex: Restaurantes, Lazer, Assinaturas, Hobbies...',
  'Investimentos': 'Ex: Aportes, Previdência...',
  'Proteção': 'Ex: Seguros, Plano de Saúde...',
  'Doações': 'Ex: Caridade, Contribuições...',
  'Impostos e Obrigações': 'Ex: IRPF, IPTU, IPVA...',
  'Dívidas': 'Ex: Empréstimos, Financiamentos...',
};

function computeBudgetTotal(categories: Category[]): string | null {
  let totalMin = 0;
  let totalMax = 0;
  let hasBudget = false;

  for (const cat of categories) {
    if (cat.status === 'active' && cat.budgetMinCents != null) {
      hasBudget = true;
      totalMin += cat.budgetMinCents;
      totalMax += cat.budgetMaxCents ?? cat.budgetMinCents;
    }
  }

  if (!hasBudget) return null;
  if (totalMin === totalMax) return formatCurrency(totalMin);
  return `${formatCurrency(totalMin)} — ${formatCurrency(totalMax)}`;
}

export function ClassificationSection({
  classification,
  categories,
  subcategoriesByCategory,
  establishments,
  spendingByCategory,
  spendingBySubcategory,
  spendingByEstablishment,
  bankAccounts,
  creditCards,
  onEditClassification,
  onAddCategory,
  onEditCategory,
  onAddSubcategory,
  onEditSubcategory,
  onAddEstablishment,
  onEditEstablishment,
  onStatusChange,
}: ClassificationSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  const activeCategories = categories.filter((c) => c.status === 'active');
  const archivedCategories = categories.filter((c) => c.status === 'archived');
  const [showArchivedCategories, setShowArchivedCategories] = useState(false);

  const budgetTotal = useMemo(() => computeBudgetTotal(categories), [categories]);
  const hint = CLASSIFICATION_HINTS[classification.name];

  // Calcular gasto total da classificação (soma dos gastos das categorias ativas)
  const classificationSpent = useMemo(() => {
    if (!spendingByCategory) return 0;
    return activeCategories.reduce((sum, cat) => sum + (spendingByCategory.get(cat.id) ?? 0), 0);
  }, [activeCategories, spendingByCategory]);

  // Calcular budget max da classificação para a budget bar
  const classificationBudgetMax = useMemo(() => {
    let total = 0;
    let hasBudget = false;
    for (const cat of activeCategories) {
      if (cat.budgetMaxCents != null) {
        hasBudget = true;
        total += cat.budgetMaxCents;
      } else if (cat.budgetMinCents != null) {
        hasBudget = true;
        total += cat.budgetMinCents;
      }
    }
    return hasBudget ? total : 0;
  }, [activeCategories]);

  function handleReactivate() {
    startTransition(async () => {
      const result = await reactivateClassificationAction({ id: classification.id });
      if (result.success) {
        toast.success(`Classificação "${classification.name}" reativada.`);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

  return (
    <div className="mb-3">
      {/* Header — Level 1 do padrão "Lista Colapsável" do DS */}
      <div
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50',
          expanded
            ? 'rounded-t-[var(--radius-card)]'
            : 'rounded-[var(--radius-card)]'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <ChevronDown
          className={cn(
            'size-[18px] shrink-0 text-muted-foreground transition-transform duration-150',
            !expanded && '-rotate-90'
          )}
        />

        <span className="shrink-0 text-sm">📊</span>
        <div className="flex min-w-0 flex-shrink-0 flex-col">
          <span className="text-sm font-semibold">
            {classification.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {classification.activeCategoryCount}{' '}
            {classification.activeCategoryCount === 1 ? 'categoria' : 'categorias'}
          </span>
        </div>

        {classificationBudgetMax > 0 && (
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              <strong className="font-semibold text-foreground">{formatCurrency(classificationSpent)}</strong>
              {' '}/ {budgetTotal}
            </span>
            <BudgetProgressBar
              spent={classificationSpent}
              budget={classificationBudgetMax}
              variant="mini"
            />
            <span className={cn(
              'text-[11px] tabular-nums',
              classificationSpent / classificationBudgetMax <= 0.6 && 'text-positive-text',
              classificationSpent / classificationBudgetMax > 0.6 && classificationSpent / classificationBudgetMax <= 0.8 && 'text-attention-text',
              classificationSpent / classificationBudgetMax > 0.8 && classificationSpent / classificationBudgetMax <= 1 && 'text-alert-text',
              classificationSpent / classificationBudgetMax > 1 && 'text-critical-text',
            )}>
              {classificationBudgetMax > 0 && classificationSpent <= classificationBudgetMax
                ? `${Math.round((classificationSpent / classificationBudgetMax) * 100)}% do máx — resta ${formatCurrency(classificationBudgetMax - classificationSpent)}`
                : classificationBudgetMax > 0
                  ? `${Math.round((classificationSpent / classificationBudgetMax) * 100)}% — excedeu ${formatCurrency(classificationSpent - classificationBudgetMax)}`
                  : ''
              }
            </span>
          </div>
        )}

        {classificationBudgetMax === 0 && classificationSpent > 0 && (
          <span className="text-xs tabular-nums font-medium text-muted-foreground">
            <strong className="font-semibold text-foreground">{formatCurrency(classificationSpent)}</strong>
            {' '}<span className="text-muted-foreground">(sem orçamento)</span>
          </span>
        )}

        {classificationBudgetMax === 0 && classificationSpent === 0 && budgetTotal && (
          <span className="text-xs text-muted-foreground tabular-nums font-medium">
            {budgetTotal}
          </span>
        )}

        <div
          className="flex gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {classification.status === 'active' && (
            <>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => onAddCategory(classification.id)}
                title="Adicionar categoria"
              >
                <Plus className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() => onEditClassification(classification)}
                title="Editar classificação"
              >
                <Pencil className="size-3.5" />
              </Button>
            </>
          )}
          {classification.status === 'archived' && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleReactivate}
              disabled={isPending}
            >
              {isPending ? 'Reativando...' : 'Reativar'}
            </Button>
          )}
        </div>
      </div>

      {/* Body — arredondamento inferior, borda sem topo (continuação visual do header) */}
      {expanded && (
        <div className="overflow-hidden rounded-b-[var(--radius-card)] border border-t-0 border-border">
          {activeCategories.length === 0 && archivedCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center m-3 border border-dashed border-border rounded-card">
              <p className="text-sm text-muted-foreground">Nenhuma categoria ainda</p>
              {classification.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddCategory(classification.id)}
                >
                  + Adicionar categoria
                </Button>
              )}
              {hint && (
                <p className="text-xs text-muted-foreground">{hint}</p>
              )}
            </div>
          ) : (
            <>
              {activeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  subcategories={subcategoriesByCategory.get(category.id) ?? []}
                  establishments={establishments}
                  spendingByCategory={spendingByCategory}
                  spendingBySubcategory={spendingBySubcategory}
                  spendingByEstablishment={spendingByEstablishment}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  onEdit={() => onEditCategory(category)}
                  onAddSubcategory={() => onAddSubcategory(category.id)}
                  onEditSubcategory={onEditSubcategory}
                  onAddEstablishment={onAddEstablishment}
                  onEditEstablishment={onEditEstablishment}
                  onStatusChange={onStatusChange}
                />
              ))}

              {archivedCategories.length > 0 && (
                <div className="border-t border-border px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => setShowArchivedCategories(!showArchivedCategories)}
                  >
                    {showArchivedCategories
                      ? 'Ocultar arquivadas'
                      : `Mostrar arquivadas (${archivedCategories.length})`}
                  </Button>
                  {showArchivedCategories && (
                    <div className="mt-1 opacity-60">
                      {archivedCategories.map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          subcategories={subcategoriesByCategory.get(category.id) ?? []}
                          establishments={establishments}
                          spendingByCategory={spendingByCategory}
                          spendingBySubcategory={spendingBySubcategory}
                          spendingByEstablishment={spendingByEstablishment}
                          bankAccounts={bankAccounts}
                          creditCards={creditCards}
                          onEdit={() => onEditCategory(category)}
                          onAddSubcategory={() => onAddSubcategory(category.id)}
                          onEditSubcategory={onEditSubcategory}
                          onAddEstablishment={onAddEstablishment}
                          onEditEstablishment={onEditEstablishment}
                          onStatusChange={onStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
