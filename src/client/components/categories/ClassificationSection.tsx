'use client';

import { useState, useTransition, useMemo } from 'react';
import { toast } from 'sonner';
import { ChevronDown, Settings } from 'lucide-react';
import { cn } from '@/client/utils/utils';

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
  const hint = CLASSIFICATION_HINTS[classification.name];

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

        <span className="flex-1 text-sm font-semibold">
          {classification.name}
        </span>

        {budgetTotal && (
          <span className="text-xs text-muted-foreground tabular-nums font-medium">
            {budgetTotal}
          </span>
        )}

        <span className="text-xs font-medium text-muted-foreground">
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
              <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-card bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
                <div className="absolute -top-1.5 right-2.5 size-3 rotate-45 bg-popover ring-1 ring-foreground/10 [clip-path:polygon(0%_0%,100%_0%,0%_100%)]" />
                {classification.status === 'active' ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowMenu(false);
                        onEditClassification(classification);
                      }}
                    >
                      Renomear
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setShowMenu(false);
                        onMergeClassification(classification);
                      }}
                    >
                      Mesclar com outra
                    </Button>
                    <div className="h-px bg-border my-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setShowMenu(false);
                        setShowArchiveDialog(true);
                      }}
                    >
                      Arquivar
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setShowMenu(false);
                      handleReactivate();
                    }}
                    disabled={isPending}
                  >
                    {isPending ? 'Reativando...' : 'Reativar'}
                  </Button>
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

      {/* Body — arredondamento inferior, borda sem topo (continuação visual do header) */}
      {expanded && (
        <div className="overflow-hidden rounded-b-[var(--radius-card)] border border-t-0 border-border">
          {activeCategories.length === 0 && archivedCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
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
                  onEdit={() => onEditCategory(category)}
                  onAddSubcategory={() => onAddSubcategory(category.id)}
                  onEditSubcategory={onEditSubcategory}
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
