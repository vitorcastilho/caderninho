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
    <div className="border-b border-border last:border-b-0">
      {/* Category row — Level 2 do padrão "Lista Colapsável" do DS */}
      <div className="group/cat flex items-center gap-2 bg-muted/30 px-4 py-2.5 pl-10 transition-colors hover:bg-muted/60">
        <span
          className="flex-1 cursor-pointer text-sm font-medium hover:text-primary"
          onClick={onEdit}
        >
          {category.name}
        </span>

        {budgetDisplay && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {budgetDisplay}
          </span>
        )}

        <div className="flex gap-1 opacity-0 transition-opacity group-hover/cat:opacity-100">
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
      {activeSubcategories.map((sub) => (
        <div
          key={sub.id}
          className="group/sub flex items-center gap-3 border-b border-border bg-card py-3 pr-4 pl-16 transition-colors last:border-b-0 hover:bg-muted/30"
        >
          <div className="size-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span className="flex-1 text-sm">{sub.name}</span>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover/sub:opacity-100">
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
      ))}

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
    </div>
  );
}
