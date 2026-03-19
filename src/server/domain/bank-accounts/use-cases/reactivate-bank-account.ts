import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface ReactivateBankAccountParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateBankAccount(
  deps: { repository: BankAccountRepository; auditLogger: AuditLogger },
  params: ReactivateBankAccountParams,
): Promise<Result<BankAccount>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }

  if (existing.status === 'active') {
    return err('BANK_ACCOUNT_ALREADY_ACTIVE', 'Esta conta já está ativa.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'bank_account',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
