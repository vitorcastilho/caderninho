import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface ArchiveInvestmentParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveInvestment(
  deps: { repository: InvestmentRepository; auditLogger: AuditLogger },
  params: ArchiveInvestmentParams,
): Promise<Result<Investment>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INVESTMENT_NOT_FOUND', 'Investimento não encontrado.');
  }

  if (existing.status === 'archived') {
    return err('INVESTMENT_ALREADY_ARCHIVED', 'Este investimento já está arquivado.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'investment',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
