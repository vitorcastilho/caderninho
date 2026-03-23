'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Info, X } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
import { Breadcrumb } from '@/client/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/client/components/ui/dialog';
import { ClassificationSection } from './ClassificationSection';
import { ClassificationForm } from './ClassificationForm';
import { ClassificationMergeDialog } from './ClassificationMergeDialog';
import { CategoryForm } from './CategoryForm';
import { SubcategoryForm } from './SubcategoryForm';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';

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
  defaultPaymentMethodType: string | null;
  defaultPaymentMethodId: string | null;
  status: 'active' | 'archived';
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
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

interface CategoryTreeProps {
  initialClassifications: Classification[];
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
}

export function CategoryTree({
  initialClassifications,
  initialCategories,
  initialSubcategories,
  bankAccounts,
  creditCards,
}: CategoryTreeProps) {
  const [classifications, setClassifications] = useState<Classification[]>(initialClassifications);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  // Dialog states
  const [showCreateClassification, setShowCreateClassification] = useState(false);
  const [editingClassification, setEditingClassification] = useState<{ id: string; name: string } | null>(null);
  const [mergingClassification, setMergingClassification] = useState<{ id: string; name: string } | null>(null);
  const [creatingCategoryForClassification, setCreatingCategoryForClassification] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
    defaultPaymentMethodType: string | null;
    defaultPaymentMethodId: string | null;
  } | null>(null);
  const [creatingSubcategoryForCategory, setCreatingSubcategoryForCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ id: string; name: string } | null>(null);

  const refreshData = useCallback(() => {
    startTransition(async () => {
      const [classResult, catResult, subResult] = await Promise.all([
        listClassificationsAction(undefined),
        listCategoriesAction(undefined),
        listSubcategoriesAction(undefined),
      ]);
      if (classResult.success) setClassifications(classResult.data);
      if (catResult.success) setCategories(catResult.data);
      if (subResult.success) setSubcategories(subResult.data);
      if (!classResult.success || !catResult.success || !subResult.success) {
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Categorias</h1>
          <Button onClick={() => setShowCreateClassification(true)}>
            + Nova classificação
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Organize seus gastos em uma hierarquia: classificação &rarr; categoria &rarr; subcategoria
        </p>
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

      {/* Create Classification Dialog */}
      <Dialog open={showCreateClassification} onOpenChange={setShowCreateClassification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Classificação</DialogTitle>
          </DialogHeader>
          <ClassificationForm
            mode="create"
            nextDisplayOrder={classifications.length + 1}
            onSuccess={() => {
              setShowCreateClassification(false);
              refreshData();
            }}
            onCancel={() => setShowCreateClassification(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Classification Dialog */}
      <Dialog open={!!editingClassification} onOpenChange={(open) => !open && setEditingClassification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Classificação</DialogTitle>
          </DialogHeader>
          {editingClassification && (
            <ClassificationForm
              mode="edit"
              defaultValues={editingClassification}
              onSuccess={() => {
                setEditingClassification(null);
                refreshData();
              }}
              onCancel={() => setEditingClassification(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Merge Classification Dialog */}
      <Dialog open={!!mergingClassification} onOpenChange={(open) => !open && setMergingClassification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mesclar Classificação</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={!!creatingCategoryForClassification} onOpenChange={(open) => !open && setCreatingCategoryForClassification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
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
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog open={!!creatingSubcategoryForCategory} onOpenChange={(open) => !open && setCreatingSubcategoryForCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Subcategoria</DialogTitle>
          </DialogHeader>
          {creatingSubcategoryForCategory && (
            <SubcategoryForm
              mode="create"
              categoryId={creatingSubcategoryForCategory}
              onSuccess={() => {
                setCreatingSubcategoryForCategory(null);
                refreshData();
              }}
              onCancel={() => setCreatingSubcategoryForCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={!!editingSubcategory} onOpenChange={(open) => !open && setEditingSubcategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Subcategoria</DialogTitle>
          </DialogHeader>
          {editingSubcategory && (
            <SubcategoryForm
              mode="edit"
              defaultValues={editingSubcategory}
              onSuccess={() => {
                setEditingSubcategory(null);
                refreshData();
              }}
              onCancel={() => setEditingSubcategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Classification sections */}
      {activeClassifications.length === 0 && archivedClassifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma classificação cadastrada.</p>
          <Button variant="secondary" size="sm" onClick={() => setShowCreateClassification(true)}>
            + Nova classificação
          </Button>
          <p className="text-xs text-muted-foreground">Classificações organizam suas categorias por tipo de necessidade.</p>
        </div>
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
                  onEditClassification={(c) => setEditingClassification({ id: c.id, name: c.name })}
                  onMergeClassification={(c) => setMergingClassification({ id: c.id, name: c.name })}
                  onAddCategory={(classificationId) => setCreatingCategoryForClassification(classificationId)}
                  bankAccounts={bankAccounts}
                  creditCards={creditCards}
                  onEditCategory={(cat) =>
                    setEditingCategory({
                      id: cat.id,
                      name: cat.name,
                      classificationId: cat.classificationId,
                      budgetMinCents: cat.budgetMinCents,
                      budgetMaxCents: cat.budgetMaxCents,
                      defaultPaymentMethodType: cat.defaultPaymentMethodType,
                      defaultPaymentMethodId: cat.defaultPaymentMethodId,
                    })
                  }
                  onAddSubcategory={(categoryId) => setCreatingSubcategoryForCategory(categoryId)}
                  onEditSubcategory={(sub) => setEditingSubcategory({ id: sub.id, name: sub.name })}
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
                      bankAccounts={bankAccounts}
                      creditCards={creditCards}
                      onEditClassification={(c) => setEditingClassification({ id: c.id, name: c.name })}
                      onMergeClassification={(c) => setMergingClassification({ id: c.id, name: c.name })}
                      onAddCategory={(classificationId) => setCreatingCategoryForClassification(classificationId)}
                      onEditCategory={(cat) =>
                        setEditingCategory({
                          id: cat.id,
                          name: cat.name,
                          classificationId: cat.classificationId,
                          budgetMinCents: cat.budgetMinCents,
                          budgetMaxCents: cat.budgetMaxCents,
                          defaultPaymentMethodType: cat.defaultPaymentMethodType,
                          defaultPaymentMethodId: cat.defaultPaymentMethodId,
                        })
                      }
                      onAddSubcategory={(categoryId) => setCreatingSubcategoryForCategory(categoryId)}
                      onEditSubcategory={(sub) => setEditingSubcategory({ id: sub.id, name: sub.name })}
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
