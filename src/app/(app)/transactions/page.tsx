import { listTransactionsAction } from '@/server/actions/transaction.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { listIncomeSourcesAction } from '@/server/actions/income-source.actions';
import { TransactionList } from '@/client/components/transactions/TransactionList';

export default async function TransactionsPage() {
  const [
    transactionsResult,
    categoriesResult,
    subcategoriesResult,
    bankAccountsResult,
    creditCardsResult,
    incomeSourcesResult,
  ] = await Promise.all([
    listTransactionsAction({}),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
    listBankAccountsAction(undefined),
    listCreditCardsAction(undefined),
    listIncomeSourcesAction(undefined),
  ]);

  const initialTransactions = transactionsResult.success ? transactionsResult.data.rows : [];
  const initialTotal = transactionsResult.success ? transactionsResult.data.total : 0;
  const initialHasMore = transactionsResult.success ? transactionsResult.data.hasMore : false;
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const subcategories = subcategoriesResult.success ? subcategoriesResult.data : [];
  const bankAccounts = bankAccountsResult.success ? bankAccountsResult.data : [];
  const creditCards = creditCardsResult.success ? creditCardsResult.data : [];
  const incomeSources = incomeSourcesResult.success ? incomeSourcesResult.data : [];

  return (
    <TransactionList
      initialTransactions={initialTransactions}
      initialTotal={initialTotal}
      initialHasMore={initialHasMore}
      categories={categories}
      subcategories={subcategories}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
      incomeSources={incomeSources}
    />
  );
}
