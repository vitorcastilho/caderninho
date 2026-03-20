'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';

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
import { formatCurrency } from '@/client/utils/format-currency';
import {
  archiveCategoryAction,
  reactivateCategoryAction,
} from '@/server/actions/category.actions';
import {
  archiveSubcategoryAction,
  reactivateSubcategoryAction,
} from '@/server/actions/subcategory.actions';

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

interface CategoryCardProps {
  category: Category;
  subcategories: Subcategory[];
  onEdit: () => void;
  onAddSubcategory: () => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onStatusChange: () => void;
}

function formatBudget(minCents: number | null, maxCents: number | null): string | null {
  if (minCents == null) return null;
  if (maxCents == null || maxCents === minCents) return formatCurrency(minCents);
  return `${formatCurrency(minCents)} — ${formatCurrency(maxCents)}`;
}

export function CategoryCard({
  category,
  subcategories,
  onEdit,
  onAddSubcategory,
  onEditSubcategory,
  onStatusChange,
}: CategoryCardProps) {
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeSubcategories = subcategories.filter((s) => s.status === 'active');
  const archivedSubcategories = subcategories.filter((s) => s.status === 'archived');
  const [showArchivedSubs, setShowArchivedSubs] = useState(false);

  const budgetDisplay = formatBudget(category.budgetMinCents, category.budgetMaxCents);

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
    <div className="pl-6">
      {/* Category row */}
      <div className="flex items-center gap-2 py-1.5">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 text-left hover:text-primary transition-colors"
        >
          <span className="text-sm font-medium text-foreground">
            {category.name}
          </span>
          {budgetDisplay && (
            <span className="text-xs text-muted-foreground tabular-nums">
              <span className="opacity-60">Orçamento:</span> {budgetDisplay}
            </span>
          )}
        </button>

        <span className="flex-1" />

        <div className="flex gap-1">
          {category.status === 'active' && (
            <>
              <Button
                variant="secondary"
                size="xs"
                onClick={onAddSubcategory}
              >
                + Subcategoria
              </Button>
              <Button variant="ghost" size="xs" onClick={onEdit}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive"
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

      {/* Subcategories */}
      {activeSubcategories.length > 0 && (
        <div className="pl-4 border-l border-border ml-1">
          {activeSubcategories.map((sub) => (
            <div key={sub.id} className="flex items-center gap-2 py-1">
              <button
                onClick={() => onEditSubcategory(sub)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {sub.name}
              </button>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 text-xs px-1"
                  onClick={() => onEditSubcategory(sub)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 text-xs px-1 text-destructive"
                  onClick={() => handleArchiveSubcategory(sub)}
                  disabled={isPending}
                >
                  Arquivar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {archivedSubcategories.length > 0 && (
        <div className="pl-4 ml-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-5 px-1"
            onClick={() => setShowArchivedSubs(!showArchivedSubs)}
          >
            {showArchivedSubs
              ? 'Ocultar'
              : `+${archivedSubcategories.length} arquivada${archivedSubcategories.length > 1 ? 's' : ''}`}
          </Button>
          {showArchivedSubs && (
            <div className="border-l border-border opacity-60">
              {archivedSubcategories.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 py-1">
                  <span className="text-xs text-muted-foreground">{sub.name}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-5 text-xs px-1"
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
    </div>
  );
}
