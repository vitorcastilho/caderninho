import { getCurrentMonthBR, monthToDateRangeBR } from '@/shared/utils/month-range';
import {
  listTransactionsAction,
  getTransactionPeriodSummaryAction,
} from '@/server/actions/transaction.actions';
import { listCategoriesAction } from '@/server/actions/category.actions';
import { listSubcategoriesAction } from '@/server/actions/subcategory.actions';
import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { listCreditCardsAction } from '@/server/actions/credit-card.actions';
import { listIncomeSourcesAction } from '@/server/actions/income-source.actions';
import { TransactionList } from '@/client/components/transactions/TransactionList';

export default async function TransactionsPage() {
  // A tela abre no mês corrente (fuso de Brasília) — os cards dizem "no mês".
  // O client recebe o mesmo mês em `initialMonth` para não refazer o fetch.
  const initialMonth = getCurrentMonthBR();
  const monthRange = monthToDateRangeBR(initialMonth);

  const [
    transactionsResult,
    anyTransactionResult,
    summaryResult,
    categoriesResult,
    subcategoriesResult,
    bankAccountsResult,
    creditCardsResult,
    incomeSourcesResult,
  ] = await Promise.all([
    listTransactionsAction(monthRange),
    // Só para saber se a organização tem alguma transação (qualquer mês):
    // define o empty state de primeiro uso.
    listTransactionsAction({ limit: 1 }),
    getTransactionPeriodSummaryAction(monthRange),
    listCategoriesAction(undefined),
    listSubcategoriesAction(undefined),
    listBankAccountsAction(undefined),
    listCreditCardsAction(undefined),
    listIncomeSourcesAction(undefined),
  ]);

  const initialTransactions = transactionsResult.success ? transactionsResult.data.rows : [];
  const initialTotal = transactionsResult.success ? transactionsResult.data.total : 0;
  const initialHasMore = transactionsResult.success ? transactionsResult.data.hasMore : false;
  const hasAnyTransactions = anyTransactionResult.success
    ? anyTransactionResult.data.total > 0
    : true;
  const initialSummary = summaryResult.success ? summaryResult.data : undefined;
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
      initialSummary={initialSummary}
      initialMonth={initialMonth}
      hasAnyTransactions={hasAnyTransactions}
      categories={categories}
      subcategories={subcategories}
      bankAccounts={bankAccounts}
      creditCards={creditCards}
      incomeSources={incomeSources}
    />
  );
}
