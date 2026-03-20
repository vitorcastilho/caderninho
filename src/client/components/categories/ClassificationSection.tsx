'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronRight, ChevronDown, Settings } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/client/components/ui/dialog';
import { CategoryCard } from './CategoryCard';
import { formatCurrency } from '@/client/utils/format-currency';
import {
  archiveClassificationAction,
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
  classificationId: string;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  status: 'active' | 'archived';
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  status: 'active' | 'archived';
}

interface ClassificationSectionProps {
  classification: Classification;
  categories: Category[];
  subcategoriesByCategory: Map<string, Subcategory[]>;
  onEditClassification: (classification: Classification) => void;
  onMergeClassification: (classification: Classification) => void;
  onAddCategory: (classificationId: string) => void;
  onEditCategory: (category: Category) => void;
  onAddSubcategory: (categoryId: string) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onStatusChange: () => void;
}

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
  onEditClassification,
  onMergeClassification,
  onAddCategory,
  onEditCategory,
  onAddSubcategory,
  onEditSubcategory,
  onStatusChange,
}: ClassificationSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeCategories = categories.filter((c) => c.status === 'active');
  const archivedCategories = categories.filter((c) => c.status === 'archived');
  const [showArchivedCategories, setShowArchivedCategories] = useState(false);

  const budgetTotal = useMemo(() => computeBudgetTotal(categories), [categories]);

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveClassificationAction({ id: classification.id });
      if (result.success) {
        toast.success(`Classificação "${classification.name}" arquivada.`);
        setShowArchiveDialog(false);
        onStatusChange();
      } else {
        toast.error(result.error.message);
      }
    });
  }

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
    <div className="rounded-card bg-card border border-border">
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}

        <span className="text-sm font-semibold text-foreground">
          {classification.name}
        </span>

        {budgetTotal && (
          <span className="text-xs text-muted-foreground tabular-nums font-medium">
            {budgetTotal}
          </span>
        )}

        <span className="flex-1" />

        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
          {classification.activeCategoryCount}{' '}
          {classification.activeCategoryCount === 1 ? 'categoria' : 'categorias'}
        </span>

        {classification.status === 'active' && (
          <Button
            variant="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onAddCategory(classification.id);
            }}
          >
            + Categoria
          </Button>
        )}

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowMenu(!showMenu)}
            title="Opções da classificação"
          >
            <Settings className="size-4" />
          </Button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 min-w-[200px] rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
                {classification.status === 'active' ? (
                  <>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setShowMenu(false);
                        onEditClassification(classification);
                      }}
                    >
                      Renomear
                    </button>
                    <button
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setShowMenu(false);
                        onMergeClassification(classification);
                      }}
                    >
                      Mesclar com outra
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                      onClick={() => {
                        setShowMenu(false);
                        setShowArchiveDialog(true);
                      }}
                    >
                      Arquivar
                    </button>
                  </>
                ) : (
                  <button
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      setShowMenu(false);
                      handleReactivate();
                    }}
                    disabled={isPending}
                  >
                    {isPending ? 'Reativando...' : 'Reativar'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar classificação</DialogTitle>
            <DialogDescription>
              A classificação &ldquo;{classification.name}&rdquo; será arquivada. Ela poderá ser reativada
              depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button variant="destructive" onClick={handleArchive} disabled={isPending}>
              {isPending ? 'Arquivando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories */}
      {expanded && (
        <div className="px-3 pb-3">
          {activeCategories.length === 0 && archivedCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
              <p className="text-xs">Nenhuma categoria ainda</p>
              {classification.status === 'active' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddCategory(classification.id)}
                >
                  + Adicionar categoria
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {activeCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    subcategories={subcategoriesByCategory.get(category.id) ?? []}
                    onEdit={() => onEditCategory(category)}
                    onAddSubcategory={() => onAddSubcategory(category.id)}
                    onEditSubcategory={onEditSubcategory}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>

              {archivedCategories.length > 0 && (
                <div className="mt-1">
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
                    <div className="space-y-1 mt-1 opacity-60">
                      {archivedCategories.map((category) => (
                        <CategoryCard
                          key={category.id}
                          category={category}
                          subcategories={subcategoriesByCategory.get(category.id) ?? []}
                          onEdit={() => onEditCategory(category)}
                          onAddSubcategory={() => onAddSubcategory(category.id)}
                          onEditSubcategory={onEditSubcategory}
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
