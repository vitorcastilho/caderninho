import { CategoryTree } from '@/client/components/categories/CategoryTree';
import { seedDefaultClassificationsAction } from '@/server/actions/classification.actions';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';

export default async function CategoriesPage() {
  await seedDefaultClassificationsAction(undefined);

  const [classificationsResult, categoriesResult, subcategoriesResult] = await Promise.all([
    listClassificationsAction(undefined),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
  ]);

  const classifications = classificationsResult.success ? classificationsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const subcategories = subcategoriesResult.success ? subcategoriesResult.data : [];

  return (
    <CategoryTree
      initialClassifications={classifications}
      initialCategories={categories}
      initialSubcategories={subcategories}
    />
  );
}
