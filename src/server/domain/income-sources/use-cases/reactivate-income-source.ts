import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface ReactivateIncomeSourceParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateIncomeSource(
  deps: { repository: IncomeSourceRepository; auditLogger: AuditLogger },
  params: ReactivateIncomeSourceParams,
): Promise<Result<IncomeSource>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INCOME_SOURCE_NOT_FOUND', 'Fonte de receita não encontrada.');
  }

  if (existing.status === 'active') {
    return err('INCOME_SOURCE_ALREADY_ACTIVE', 'Esta fonte de receita já está ativa.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'income_source',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
