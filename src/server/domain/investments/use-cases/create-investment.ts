import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface CreateInvestmentParams {
  name: string;
  institution: string;
  type: 'renda_fixa' | 'renda_variavel' | 'reserva';
  balanceCents: number;
  yieldRateBasisPoints?: number;
  maturityDate?: string;
  organizationId: string;
  userId: string;
}

export async function createInvestment(
  deps: { repository: InvestmentRepository; auditLogger: AuditLogger },
  params: CreateInvestmentParams,
): Promise<Result<Investment>> {
  const id = crypto.randomUUID();

  const investment = await deps.repository.create({
    id,
    name: params.name,
    institution: params.institution,
    type: params.type,
    balanceCents: params.balanceCents,
    yieldRateBasisPoints: params.yieldRateBasisPoints ?? null,
    maturityDate: params.maturityDate ?? null,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'investment',
    entityId: investment.id,
    oldValue: null,
    newValue: {
      name: investment.name,
      institution: investment.institution,
      type: investment.type,
      balanceCents: investment.balanceCents,
      yieldRateBasisPoints: investment.yieldRateBasisPoints,
    },
  });

  return ok(investment);
}
