import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import { logAudit } from '@/server/infrastructure/audit/audit.service';
import type {
  BankAccount,
  BankAccountRepository,
} from '../repositories/bank-account.repository';

interface ArchiveBankAccountParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveBankAccount(
  repository: BankAccountRepository,
  params: ArchiveBankAccountParams,
): Promise<Result<BankAccount>> {
  const existing = await repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('BANK_ACCOUNT_ALREADY_ARCHIVED', 'Esta conta já está arquivada.');
  }

  const archived = await repository.updateStatus(params.id, params.organizationId, 'archived');

  await logAudit({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'bank_account',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
