import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import { logAudit } from '@/server/infrastructure/audit/audit.service';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface CreateBankAccountParams {
  name: string;
  bank: string;
  balanceCents: number;
  organizationId: string;
  userId: string;
}

export async function createBankAccount(
  repository: BankAccountRepository,
  params: CreateBankAccountParams,
): Promise<Result<BankAccount>> {
  const id = crypto.randomUUID();

  const account = await repository.create({
    id,
    name: params.name,
    bank: params.bank,
    balanceCents: params.balanceCents,
    organizationId: params.organizationId,
  });

  await logAudit({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'bank_account',
    entityId: account.id,
    oldValue: null,
    newValue: { name: account.name, bank: account.bank, balanceCents: account.balanceCents },
  });

  return ok(account);
}
