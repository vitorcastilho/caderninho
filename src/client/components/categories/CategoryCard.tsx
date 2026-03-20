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
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Category row */}
      <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors">
        <button
          onClick={onEdit}
          className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          {category.name}
        </button>

        {budgetDisplay && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground">Orçamento:</span>
            <span className="text-xs text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded">
              {budgetDisplay}
            </span>
          </div>
        )}

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
                variant="destructive"
                size="xs"
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
        <div className="px-3 pb-2 pt-0 ml-5 border-t border-muted">
          {activeSubcategories.map((sub) => (
            <div key={sub.id} className="flex items-center gap-1.5 py-1 group/sub">
              <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
              <button
                onClick={() => onEditSubcategory(sub)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {sub.name}
              </button>
              <div className="flex gap-1 ml-auto opacity-0 group-hover/sub:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-5 text-xs px-1"
                  onClick={() => onEditSubcategory(sub)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="xs"
                  className="h-5 text-xs px-1"
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
        <div className="px-3 pb-2 ml-5">
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
            <div className="opacity-60">
              {archivedSubcategories.map((sub) => (
                <div key={sub.id} className="flex items-center gap-1.5 py-1 group/sub">
                  <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-xs text-muted-foreground">{sub.name}</span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-5 text-xs px-1 opacity-0 group-hover/sub:opacity-100 transition-opacity"
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
