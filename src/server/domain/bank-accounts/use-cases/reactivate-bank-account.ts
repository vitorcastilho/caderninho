import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import { logAudit } from '@/server/infrastructure/audit/audit.service';
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
  repository: BankAccountRepository,
  params: ReactivateBankAccountParams,
): Promise<Result<BankAccount>> {
  const existing = await repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }

  if (existing.status === 'active') {
    return err('BANK_ACCOUNT_ALREADY_ACTIVE', 'Esta conta já está ativa.');
  }

  const reactivated = await repository.updateStatus(params.id, params.organizationId, 'active');

  await logAudit({
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
