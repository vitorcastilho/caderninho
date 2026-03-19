import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
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
  deps: { repository: BankAccountRepository; auditLogger: AuditLogger },
  params: ArchiveBankAccountParams,
): Promise<Result<BankAccount>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('BANK_ACCOUNT_NOT_FOUND', 'Conta bancária não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('BANK_ACCOUNT_ALREADY_ARCHIVED', 'Esta conta já está arquivada.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
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
