import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface UpdateBankAccountParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{ name: string; bank: string; balanceCents: number }>;
}

export async function updateBankAccount(
  deps: { repository: BankAccountRepository; auditLogger: AuditLogger },
  params: UpdateBankAccountParams,
): Promise<Result<BankAccount>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'bank_account',
    entityId: params.id,
    oldValue: { name: existing.name, bank: existing.bank, balanceCents: existing.balanceCents },
    newValue: { name: updated.name, bank: updated.bank, balanceCents: updated.balanceCents },
  });

  return ok(updated);
}
