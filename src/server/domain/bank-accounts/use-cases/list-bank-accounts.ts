import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface ListBankAccountsParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listBankAccounts(
  repository: BankAccountRepository,
  params: ListBankAccountsParams,
): Promise<Result<BankAccount[]>> {
  const accounts = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(accounts);
}
