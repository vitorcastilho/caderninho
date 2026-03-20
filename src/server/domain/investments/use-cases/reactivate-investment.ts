import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface ReactivateInvestmentParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateInvestment(
  deps: { repository: InvestmentRepository; auditLogger: AuditLogger },
  params: ReactivateInvestmentParams,
): Promise<Result<Investment>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INVESTMENT_NOT_FOUND', 'Investimento não encontrado.');
  }

  if (existing.status === 'active') {
    return err('INVESTMENT_ALREADY_ACTIVE', 'Este investimento já está ativo.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'investment',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
