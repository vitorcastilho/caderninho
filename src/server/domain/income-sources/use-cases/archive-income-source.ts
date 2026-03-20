import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface ArchiveIncomeSourceParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveIncomeSource(
  deps: { repository: IncomeSourceRepository; auditLogger: AuditLogger },
  params: ArchiveIncomeSourceParams,
): Promise<Result<IncomeSource>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INCOME_SOURCE_NOT_FOUND', 'Fonte de receita não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('INCOME_SOURCE_ALREADY_ARCHIVED', 'Esta fonte de receita já está arquivada.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'income_source',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
