'use client';

import { useState, useTransition, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Info, X } from 'lucide-react';

import { Button } from '@/client/components/ui/button';
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
  status: 'active' | 'archived';
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  status: 'active' | 'archived';
}

interface CategoryTreeProps {
  initialClassifications: Classification[];
  initialCategories: Category[];
  initialSubcategories: Subcategory[];
}

export function CategoryTree({
  initialClassifications,
  initialCategories,
  initialSubcategories,
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
        <div className="flex gap-3 items-start rounded-card bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/30 dark:border-blue-900">
          <Info className="size-5 shrink-0 text-blue-600 mt-0.5 dark:text-blue-400" />
          <div className="flex-1 text-sm text-blue-900 dark:text-blue-200">
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
          <button
            onClick={() => setOnboardingDismissed(true)}
            className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors dark:text-blue-500 dark:hover:text-blue-300"
            title="Fechar"
          >
            <X className="size-4" />
          </button>
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
        <div className="text-center py-8 text-muted-foreground">
          <p>Nenhuma classificação cadastrada.</p>
          <p className="text-sm mt-1">
            Clique em &ldquo;Nova Classificação&rdquo; para começar.
          </p>
        </div>
      ) : (
        <>
          {activeClassifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma classificação ativa.</p>
          ) : (
            <div className="space-y-2">
              {activeClassifications.map((classification) => (
                <ClassificationSection
                  key={classification.id}
                  classification={classification}
                  categories={categoriesByClassification.get(classification.id) ?? []}
                  subcategoriesByCategory={subcategoriesByCategory}
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
                <div className="space-y-2 mt-2 opacity-60">
                  {archivedClassifications.map((classification) => (
                    <ClassificationSection
                      key={classification.id}
                      classification={classification}
                      categories={categoriesByClassification.get(classification.id) ?? []}
                      subcategoriesByCategory={subcategoriesByCategory}
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
