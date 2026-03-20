import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface UpdateInvestmentParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    institution: string;
    type: 'renda_fixa' | 'renda_variavel' | 'reserva';
    balanceCents: number;
    yieldRateBasisPoints: number | null;
    maturityDate: string | null;
  }>;
}

export async function updateInvestment(
  deps: { repository: InvestmentRepository; auditLogger: AuditLogger },
  params: UpdateInvestmentParams,
): Promise<Result<Investment>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('INVESTMENT_NOT_FOUND', 'Investimento não encontrado.');
  }

  const updateData = { ...params.data };

  // Edge case: troca de tipo para renda_variavel → limpar yieldRateBasisPoints
  if (updateData.type === 'renda_variavel' && existing.type !== 'renda_variavel') {
    updateData.yieldRateBasisPoints = null;
  }

  // M1 fix: troca de renda_variavel → renda_fixa/reserva exige yieldRateBasisPoints
  if (
    updateData.type &&
    updateData.type !== 'renda_variavel' &&
    existing.type === 'renda_variavel' &&
    (updateData.yieldRateBasisPoints === undefined || updateData.yieldRateBasisPoints === null)
  ) {
    return err(
      'VALIDATION_ERROR',
      'Rendimento (% CDI) é obrigatório para investimentos de renda fixa e reserva.',
    );
  }

  const updated = await deps.repository.update(params.id, params.organizationId, updateData);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'investment',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      institution: existing.institution,
      type: existing.type,
      balanceCents: existing.balanceCents,
      yieldRateBasisPoints: existing.yieldRateBasisPoints,
    },
    newValue: {
      name: updated.name,
      institution: updated.institution,
      type: updated.type,
      balanceCents: updated.balanceCents,
      yieldRateBasisPoints: updated.yieldRateBasisPoints,
    },
  });

  return ok(updated);
}
