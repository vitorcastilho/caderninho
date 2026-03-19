import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
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
  deps: { repository: BankAccountRepository; auditLogger: AuditLogger },
  params: CreateBankAccountParams,
): Promise<Result<BankAccount>> {
  const id = crypto.randomUUID();

  const account = await deps.repository.create({
    id,
    name: params.name,
    bank: params.bank,
    balanceCents: params.balanceCents,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
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
