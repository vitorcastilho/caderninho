import { listBankAccountsAction } from '@/server/actions/bank-account.actions';
import { BankAccountList } from '@/client/components/bank-accounts/BankAccountList';

export default async function AccountsPage() {
  const result = await listBankAccountsAction(undefined);

  const accounts = result.success ? result.data : [];

  return <BankAccountList initialAccounts={accounts} />;
}
