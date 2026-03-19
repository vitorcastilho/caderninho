import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface GetBankAccountParams {
  id: string;
  organizationId: string;
}

export async function getBankAccount(
  repository: BankAccountRepository,
  params: GetBankAccountParams,
): Promise<Result<BankAccount>> {
  const account = await repository.findById(params.id, params.organizationId);
  if (!account) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }
  return ok(account);
}
