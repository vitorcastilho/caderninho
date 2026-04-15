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
    listTransactionsAction(undefined),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
    listBankAccountsAction(undefined),
    listCreditCardsAction(undefined),
    listIncomeSourcesAction(undefined),
  ]);

  const transactions = transactionsResult.success ? transactionsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];
  const subcategories = subcategoriesResult.success ? subcategoriesResult.data : [];
  const bankAccounts = bankAccountsResult.success ? bankAccountsResult.data : [];
  const creditCards = creditCardsResult.success ? creditCardsResult.data : [];
  const incomeSources = incomeSourcesResult.success ? incomeSourcesResult.data : [];

  return (
    <TransactionList
      initialTransactions={transactions}
      categories={categories}
      subcategories={subcategories}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
      incomeSources={incomeSources}
    />
  );
}
