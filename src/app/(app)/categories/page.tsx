import { CategoryTree } from '@/client/components/categories/CategoryTree';
import { seedDefaultClassificationsAction } from '@/server/actions/classification.actions';
import { listClassificationsAction } from '@/server/actions/classification.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { listEstablishmentsBySubcategoryAction } from '@/server/actions/establishment.actions';
import { getMonthlySpendingSummaryAction } from '@/server/actions/transaction.actions';

export default async function CategoriesPage() {
  await seedDefaultClassificationsAction(undefined);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [classificationsResult, categoriesResult, subcategoriesResult, bankAccountsResult, creditCardsResult, spendingResult] = await Promise.all([
    listClassificationsAction(undefined),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
    listBankAccountsAction(undefined),
    listCreditCardsAction(undefined),
    getMonthlySpendingSummaryAction({ year: currentYear, month: currentMonth }),
  ]);

  const classifications = classificationsResult.success ? classificationsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const subcategories = subcategoriesResult.success ? subcategoriesResult.data : [];
  const bankAccounts = bankAccountsResult.success ? bankAccountsResult.data : [];
  const creditCards = creditCardsResult.success ? creditCardsResult.data : [];

  const spending = spendingResult.success
    ? spendingResult.data
    : { byCategory: [], bySubcategory: [], byEstablishment: [] };

  // Buscar establishments de todas as subcategorias ativas
  const activeSubs = subcategories.filter((s: { status: string }) => s.status === 'active');
  const estResults = await Promise.all(
    activeSubs.map((s: { id: string }) => listEstablishmentsBySubcategoryAction({ subcategoryId: s.id })),
  );
  const establishments = estResults
    .filter((r) => r.success)
    .flatMap((r) => (r.success ? r.data : []))
    .map((e) => ({
      id: e.id,
      name: e.name,
      emoji: e.emoji,
      subcategoryId: e.subcategoryId,
      source: e.source,
      defaultPaymentMethodType: e.defaultPaymentMethodType ?? null,
      defaultPaymentMethodId: e.defaultPaymentMethodId ?? null,
      budgetMinCents: e.budgetMinCents ?? null,
      budgetMaxCents: e.budgetMaxCents ?? null,
      visitCount: e.visitCount,
      lastVisitAt: e.lastVisitAt ? e.lastVisitAt.toISOString() : null,
      status: e.status,
    }));

  return (
    <CategoryTree
      initialClassifications={classifications}
      initialCategories={categories}
      initialSubcategories={subcategories}
      initialEstablishments={establishments}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
      initialSpending={spending}
    />
  );
}
