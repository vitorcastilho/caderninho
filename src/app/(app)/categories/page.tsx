import { CategoryTree } from '@/client/components/categories/CategoryTree';
import { seedDefaultClassificationsAction } from '@/server/actions/classification.actions';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';

export default async function CategoriesPage() {
  await seedDefaultClassificationsAction(undefined);

  const [classificationsResult, categoriesResult, subcategoriesResult, bankAccountsResult, creditCardsResult] = await Promise.all([
    listClassificationsAction(undefined),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
    listBankAccountsAction(undefined),
    listCreditCardsAction(undefined),
  ]);

  const classifications = classificationsResult.success ? classificationsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const subcategories = subcategoriesResult.success ? subcategoriesResult.data : [];
  const bankAccounts = bankAccountsResult.success ? bankAccountsResult.data : [];
  const creditCards = creditCardsResult.success ? creditCardsResult.data : [];

  return (
    <CategoryTree
      initialClassifications={classifications}
      initialCategories={categories}
      initialSubcategories={subcategories}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
    />
  );
}
