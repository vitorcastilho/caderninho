'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Info, Tags, X } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import { EmptyState } from '@/client/components/ui/empty-state';
import { PageHeader } from '@/client/components/ui/page-header';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/client/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/client/components/ui/sheet';
import { ClassificationSection } from './ClassificationSection';
import { ClassificationForm } from './ClassificationForm';
import { ClassificationMergeDialog } from './ClassificationMergeDialog';
import { CategoryForm } from './CategoryForm';
import { SubcategoryForm } from './SubcategoryForm';
import { EstablishmentForm } from './EstablishmentForm';
import { listClassificationsAction, archiveClassificationAction } from '@/server/actions/classification.actions';
import { listCategoriesAction, archiveCategoryAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction, archiveSubcategoryAction } from '@/server/actions/subcategory.actions';
import { listEstablishmentsBySubcategoryAction } from '@/server/actions/establishment.actions';
import { getMonthlySpendingSummaryAction } from '@/server/actions/transaction.actions';

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

export interface SpendingData {
  byCategory: { id: string; totalCents: number }[];
  bySubcategory: { id: string; totalCents: number }[];
  byEstablishment: { key: string; totalCents: number }[];
}

interface CategoryTreeProps {
  initialClassifications: Classification[];
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
  initialEstablishments: Establishment[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  initialSpending?: SpendingData;
}

const EMPTY_SPENDING: SpendingData = { byCategory: [], bySubcategory: [], byEstablishment: [] };

export function CategoryTree({
  initialClassifications,
  initialCategories,
  initialSubcategories,
  initialEstablishments,
  bankAccounts,
  creditCards,
  initialSpending,
}: CategoryTreeProps) {
  const [classifications, setClassifications] = useState<Classification[]>(initialClassifications);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [establishments, setEstablishments] = useState<Establishment[]>(initialEstablishments);
  const [spending, setSpending] = useState<SpendingData>(initialSpending ?? EMPTY_SPENDING);
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [showCreateClassification, setShowCreateClassification] = useState(false);
  const [editingClassification, setEditingClassification] = useState<{ id: string; name: string } | null>(null);
  const [archivingClassification, setArchivingClassification] = useState<{ id: string; name: string } | null>(null);
  const [archivingCategory, setArchivingCategory] = useState<{ id: string; name: string } | null>(null);
  const [archivingSubcategory, setArchivingSubcategory] = useState<{ id: string; name: string } | null>(null);
  const [mergingClassification, setMergingClassification] = useState<{ id: string; name: string } | null>(null);
  const [creatingCategoryForClassification, setCreatingCategoryForClassification] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    emoji: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  } | null>(null);
  const [creatingSubcategoryForCategory, setCreatingSubcategoryForCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{
    id: string;
    name: string;
    emoji: string;
    categoryId: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  } | null>(null);
  const [creatingEstablishmentForSubcategory, setCreatingEstablishmentForSubcategory] = useState<string | null>(null);
  const [editingEstablishment, setEditingEstablishment] = useState<{
    id: string;
    name: string;
    emoji: string;
    subcategoryId: string;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    visitCount: number;
    lastVisitAt: string | null;
  } | null>(null);

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const now = new Date();
      const [classResult, catResult, subResult, spendingResult] = await Promise.all([
        listClassificationsAction(undefined),
        listCategoriesAction(undefined),
        listSubcategoriesAction(undefined),
        getMonthlySpendingSummaryAction({ year: now.getFullYear(), month: now.getMonth() + 1 }),
      ]);
      if (classResult.success) setClassifications(classResult.data);
      if (catResult.success) setCategories(catResult.data);
      if (spendingResult.success) setSpending(spendingResult.data);
      if (subResult.success) {
        setSubcategories(subResult.data);
        // Buscar establishments de todas as subcategorias ativas
        const activeSubs = subResult.data.filter((s: { status: string }) => s.status === 'active');
        const estResults = await Promise.all(
          activeSubs.map((s: { id: string }) => listEstablishmentsBySubcategoryAction({ subcategoryId: s.id })),
        );
        const allEstablishments = estResults
          .filter((r) => r.success)
          .flatMap((r) => (r.success ? r.data : []))
          .map((e: Record<string, unknown>) => ({
            id: e.id as string,
            name: e.name as string,
            emoji: e.emoji as string,
            subcategoryId: e.subcategoryId as string,
            source: e.source as 'auto' | 'manual',
            defaultPaymentMethodType: (e.defaultPaymentMethodType as string) ?? null,
            defaultPaymentMethodId: (e.defaultPaymentMethodId as string) ?? null,
            budgetMinCents: (e.budgetMinCents as number) ?? null,
            budgetMaxCents: (e.budgetMaxCents as number) ?? null,
            visitCount: e.visitCount as number,
            lastVisitAt: e.lastVisitAt ? String(e.lastVisitAt) : null,
            status: e.status as 'active' | 'archived',
          }));
        setEstablishments(allEstablishments);
      }
      if (!classResult.success || !catResult.success || !subResult.success || !spendingResult.success) {
        toast.error('Erro ao atualizar dados.');
      }
    });
  }, []);

  // Group data
  const categoriesByClassification = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const cat of categories) {
      const list = map.get(cat.classificationId) ?? [];
      list.push(cat);
      map.set(cat.classificationId, list);
    }
    return map;
  }, [categories]);

  const subcategoriesByCategory = useMemo(() => {
    const map = new Map<string, Subcategory[]>();
    for (const sub of subcategories) {
      const list = map.get(sub.categoryId) ?? [];
      list.push(sub);
      map.set(sub.categoryId, list);
    }
    return map;
  }, [subcategories]);

  const spendingByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of spending.byCategory) {
      map.set(item.id, item.totalCents);
    }
    return map;
  }, [spending.byCategory]);

  const spendingBySubcategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of spending.bySubcategory) {
      map.set(item.id, item.totalCents);
    }
    return map;
  }, [spending.bySubcategory]);

  const spendingByEstablishment = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of spending.byEstablishment) {
      map.set(item.key, item.totalCents);
    }
    return map;
  }, [spending.byEstablishment]);

  const activeClassifications = classifications.filter((c) => c.status === 'active');
  const archivedClassifications = classifications.filter((c) => c.status === 'archived');

  const totalCategories = categories.filter((c) => c.status === 'active').length;
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const showOnboarding = totalCategories === 0 && !onboardingDismissed;

  return (
    <div className="col-span-full flex flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Configurações' },
            { label: 'Categorias' },
          ]}
          className="mb-1"
        />
        <PageHeader
          title="Categorias"
          description="Organize seus gastos em uma hierarquia: classificação → categoria → subcategoria → estabelecimento"
        >
          <Button onClick={() => setShowCreateClassification(true)}>
            + Nova classificação
          </Button>
        </PageHeader>
      </div>

      {showOnboarding && (
        <div className="flex gap-3 items-start rounded-card bg-info-bg border border-info p-4">
          <Info className="size-5 shrink-0 text-info mt-0.5" />
          <div className="flex-1 text-sm text-info-text">
            <p className="font-semibold mb-1">Como funciona?</p>
            <p className="mb-2">
              Seus gastos são organizados em 3 níveis para facilitar o controle do orçamento:
            </p>
            <div className="text-xs leading-relaxed">
              <p><strong>Classificação</strong> &mdash; agrupa categorias por tipo de necessidade (ex: Essenciais, Qualidade de Vida)</p>
              <p className="ml-3">&rarr; <strong>Categoria</strong> &mdash; define onde o dinheiro vai, com orçamento mensal (ex: Moradia, Alimentação)</p>
              <p className="ml-6">&rarr; <strong>Subcategoria</strong> &mdash; detalha os gastos dentro da categoria (ex: Aluguel, Supermercado)</p>
            </div>
            <p className="mt-2">
              Já criamos classificações padrão para você. Comece adicionando suas categorias de gasto dentro delas.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOnboardingDismissed(true)}
            title="Fechar"
            className="shrink-0 text-info hover:text-info-text"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {/* Create Classification Sheet */}
      <Sheet open={showCreateClassification} onOpenChange={setShowCreateClassification}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Nova Classificação</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <ClassificationForm
              mode="create"
              nextDisplayOrder={classifications.length + 1}
              onSuccess={() => {
                setShowCreateClassification(false);
                refreshData();
              }}
              onCancel={() => setShowCreateClassification(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Classification Sheet */}
      <Sheet open={!!editingClassification} onOpenChange={(open) => !open && setEditingClassification(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Editar Classificação</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editingClassification && (
              <ClassificationForm
                mode="edit"
                defaultValues={editingClassification}
                onSuccess={() => {
                  setEditingClassification(null);
                  refreshData();
                }}
                onCancel={() => setEditingClassification(null)}
                onArchive={() => {
                  const cls = editingClassification;
                  setEditingClassification(null);
                  setArchivingClassification(cls);
                }}
                onMerge={() => {
                  const cls = editingClassification;
                  setEditingClassification(null);
                  setMergingClassification(cls);
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Merge Classification Sheet */}
      <Sheet open={!!mergingClassification} onOpenChange={(open) => !open && setMergingClassification(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Mesclar Classificação</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {mergingClassification && (
              <ClassificationMergeDialog
                source={mergingClassification}
                classifications={activeClassifications}
                onSuccess={() => {
                  setMergingClassification(null);
                  refreshData();
                }}
                onCancel={() => setMergingClassification(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Archive Classification Confirm */}
      <Dialog open={!!archivingClassification} onOpenChange={(open) => !open && setArchivingClassification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar classificação</DialogTitle>
            <DialogDescription>
              A classificação &ldquo;{archivingClassification?.name}&rdquo; será arquivada. Ela poderá ser reativada depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (!archivingClassification) return;
                startTransition(async () => {
                  const result = await archiveClassificationAction({ id: archivingClassification.id });
                  if (result.success) {
                    toast.success(`Classificação "${archivingClassification.name}" arquivada.`);
                    setArchivingClassification(null);
                    refreshData();
                  } else {
                    toast.error(result.error.message);
                  }
                });
              }}
            >
              {isPending ? 'Arquivando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Category Confirm */}
      <Dialog open={!!archivingCategory} onOpenChange={(open) => !open && setArchivingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar categoria</DialogTitle>
            <DialogDescription>
              A categoria &ldquo;{archivingCategory?.name}&rdquo; será arquivada. Ela poderá ser reativada depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (!archivingCategory) return;
                startTransition(async () => {
                  const result = await archiveCategoryAction({ id: archivingCategory.id });
                  if (result.success) {
                    toast.success(`Categoria "${archivingCategory.name}" arquivada.`);
                    setArchivingCategory(null);
                    refreshData();
                  } else {
                    toast.error(result.error.message);
                  }
                });
              }}
            >
              {isPending ? 'Arquivando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Subcategory Confirm */}
      <Dialog open={!!archivingSubcategory} onOpenChange={(open) => !open && setArchivingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar subcategoria</DialogTitle>
            <DialogDescription>
              A subcategoria &ldquo;{archivingSubcategory?.name}&rdquo; será arquivada. Ela poderá ser reativada depois.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (!archivingSubcategory) return;
                startTransition(async () => {
                  const result = await archiveSubcategoryAction({ id: archivingSubcategory.id });
                  if (result.success) {
                    toast.success(`Subcategoria "${archivingSubcategory.name}" arquivada.`);
                    setArchivingSubcategory(null);
                    refreshData();
                  } else {
                    toast.error(result.error.message);
                  }
                });
              }}
            >
              {isPending ? 'Arquivando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Sheet */}
      <Sheet open={!!creatingCategoryForClassification} onOpenChange={(open) => !open && setCreatingCategoryForClassification(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Nova Categoria</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {creatingCategoryForClassification && (
              <CategoryForm
                mode="create"
                classificationId={creatingCategoryForClassification}
                classifications={activeClassifications}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setCreatingCategoryForClassification(null);
                  refreshData();
                }}
                onCancel={() => setCreatingCategoryForClassification(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Editar Categoria</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editingCategory && (
              <CategoryForm
                mode="edit"
                defaultValues={editingCategory}
                classifications={activeClassifications}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setEditingCategory(null);
                  refreshData();
                }}
                onCancel={() => setEditingCategory(null)}
                onArchive={() => {
                  const cat = editingCategory;
                  setEditingCategory(null);
                  setArchivingCategory({ id: cat.id, name: cat.name });
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Subcategory Sheet */}
      <Sheet open={!!creatingSubcategoryForCategory} onOpenChange={(open) => !open && setCreatingSubcategoryForCategory(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>
              Criar subcategoria para {categories.find((c) => c.id === creatingSubcategoryForCategory)?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {creatingSubcategoryForCategory && (
              <SubcategoryForm
                mode="create"
                categoryId={creatingSubcategoryForCategory}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setCreatingSubcategoryForCategory(null);
                  refreshData();
                }}
                onCancel={() => setCreatingSubcategoryForCategory(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Subcategory Sheet */}
      <Sheet open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>
              Editar subcategoria de {categories.find((c) => c.id === editingSubcategory?.categoryId)?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editingSubcategory && (
              <SubcategoryForm
                mode="edit"
                defaultValues={editingSubcategory}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setEditingSubcategory(null);
                  refreshData();
                }}
                onCancel={() => setEditingSubcategory(null)}
                onArchive={() => {
                  const sub = editingSubcategory;
                  setEditingSubcategory(null);
                  setArchivingSubcategory({ id: sub.id, name: sub.name });
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Create Establishment Sheet */}
      <Sheet open={!!creatingEstablishmentForSubcategory} onOpenChange={(open) => !open && setCreatingEstablishmentForSubcategory(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Novo Estabelecimento</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {creatingEstablishmentForSubcategory && (
              <EstablishmentForm
                mode="create"
                subcategoryId={creatingEstablishmentForSubcategory}
                subcategories={subcategories.filter((s) => s.status === 'active').map((s) => ({ id: s.id, name: s.name }))}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setCreatingEstablishmentForSubcategory(null);
                  refreshData();
                }}
                onCancel={() => setCreatingEstablishmentForSubcategory(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Establishment Sheet */}
      <Sheet open={!!editingEstablishment} onOpenChange={(open) => !open && setEditingEstablishment(null)}>
        <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Editar Estabelecimento</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {editingEstablishment && (
              <EstablishmentForm
                mode="edit"
                defaultValues={editingEstablishment}
                subcategories={subcategories.filter((s) => s.status === 'active').map((s) => ({ id: s.id, name: s.name }))}
                bankAccounts={bankAccounts}
                creditCards={creditCards}
                onSuccess={() => {
                  setEditingEstablishment(null);
                  refreshData();
                }}
                onCancel={() => setEditingEstablishment(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Classification sections */}
      {activeClassifications.length === 0 && archivedClassifications.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma classificação cadastrada"
          description="Classificações organizam suas categorias por tipo de necessidade."
          actionLabel="+ Nova classificação"
          onAction={() => setShowCreateClassification(true)}
        />
      ) : (
        <>
          {activeClassifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma classificação ativa.</p>
          ) : (
            <div className="space-y-0">
              {activeClassifications.map((classification) => (
                <ClassificationSection
                  key={classification.id}
                  classification={classification}
                  categories={categoriesByClassification.get(classification.id) ?? []}
                  subcategoriesByCategory={subcategoriesByCategory}
                  establishments={establishments}
                  spendingByCategory={spendingByCategory}
                  spendingBySubcategory={spendingBySubcategory}
                  spendingByEstablishment={spendingByEstablishment}
                  onEditClassification={(c) => setEditingClassification({ id: c.id, name: c.name })}

                  onAddCategory={(classificationId) => setCreatingCategoryForClassification(classificationId)}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  onEditCategory={(cat) =>
                    setEditingCategory({
                      id: cat.id,
                      name: cat.name,
                      emoji: cat.emoji,
                      classificationId: cat.classificationId,
                      budgetMinCents: cat.budgetMinCents,
                      budgetMaxCents: cat.budgetMaxCents,
                      defaultPaymentMethodType: cat.defaultPaymentMethodType,
                      defaultPaymentMethodId: cat.defaultPaymentMethodId,
                    })
                  }
                  onAddSubcategory={(categoryId) => setCreatingSubcategoryForCategory(categoryId)}
                  onEditSubcategory={(sub) => setEditingSubcategory({
                      id: sub.id,
                      name: sub.name,
                      emoji: sub.emoji,
                      categoryId: sub.categoryId,
                      defaultPaymentMethodType: sub.defaultPaymentMethodType,
                      defaultPaymentMethodId: sub.defaultPaymentMethodId,
                    })}
                  onAddEstablishment={(subcategoryId) => setCreatingEstablishmentForSubcategory(subcategoryId)}
                  onEditEstablishment={(est) => setEditingEstablishment({
                      id: est.id,
                      name: est.name,
                      emoji: est.emoji,
                      subcategoryId: est.subcategoryId,
                      defaultPaymentMethodType: est.defaultPaymentMethodType,
                      defaultPaymentMethodId: est.defaultPaymentMethodId,
                      budgetMinCents: est.budgetMinCents,
                      budgetMaxCents: est.budgetMaxCents,
                      visitCount: est.visitCount,
                      lastVisitAt: est.lastVisitAt,
                    })}
                  onStatusChange={refreshData}
                />
              ))}
            </div>
          )}

          {archivedClassifications.length > 0 && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
              >
                {showArchived
                  ? 'Ocultar arquivadas'
                  : `Mostrar arquivadas (${archivedClassifications.length})`}
              </Button>
              {showArchived && (
                <div className="space-y-0 mt-2 opacity-60">
                  {archivedClassifications.map((classification) => (
                    <ClassificationSection
                      key={classification.id}
                      classification={classification}
                      categories={categoriesByClassification.get(classification.id) ?? []}
                      subcategoriesByCategory={subcategoriesByCategory}
                      establishments={establishments}
                      spendingByCategory={spendingByCategory}
                      spendingBySubcategory={spendingBySubcategory}
                      spendingByEstablishment={spendingByEstablishment}
                      bankAccounts={bankAccounts}
                      creditCards={creditCards}
                      onEditClassification={(c) => setEditingClassification({ id: c.id, name: c.name })}

                      onAddCategory={(classificationId) => setCreatingCategoryForClassification(classificationId)}
                      onEditCategory={(cat) =>
                        setEditingCategory({
                          id: cat.id,
                          name: cat.name,
                          emoji: cat.emoji,
                          classificationId: cat.classificationId,
                          budgetMinCents: cat.budgetMinCents,
                          budgetMaxCents: cat.budgetMaxCents,
                          defaultPaymentMethodType: cat.defaultPaymentMethodType,
                          defaultPaymentMethodId: cat.defaultPaymentMethodId,
                        })
                      }
                      onAddSubcategory={(categoryId) => setCreatingSubcategoryForCategory(categoryId)}
                      onEditSubcategory={(sub) => setEditingSubcategory({
                      id: sub.id,
                      name: sub.name,
                      emoji: sub.emoji,
                      categoryId: sub.categoryId,
                      defaultPaymentMethodType: sub.defaultPaymentMethodType,
                      defaultPaymentMethodId: sub.defaultPaymentMethodId,
                    })}
                      onAddEstablishment={(subcategoryId) => setCreatingEstablishmentForSubcategory(subcategoryId)}
                      onEditEstablishment={(est) => setEditingEstablishment({
                      id: est.id,
                      name: est.name,
                      emoji: est.emoji,
                      subcategoryId: est.subcategoryId,
                      defaultPaymentMethodType: est.defaultPaymentMethodType,
                      defaultPaymentMethodId: est.defaultPaymentMethodId,
                      budgetMinCents: est.budgetMinCents,
                      budgetMaxCents: est.budgetMaxCents,
                      visitCount: est.visitCount,
                      lastVisitAt: est.lastVisitAt,
                    })}
                      onStatusChange={refreshData}
                    />
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
