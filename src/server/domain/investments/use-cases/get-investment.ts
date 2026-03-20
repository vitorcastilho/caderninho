import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface GetInvestmentParams {
  id: string;
  organizationId: string;
}

export async function getInvestment(
  repository: InvestmentRepository,
  params: GetInvestmentParams,
): Promise<Result<Investment>> {
  const investment = await repository.findById(params.id, params.organizationId);
  if (!investment) {
    return err('INVESTMENT_NOT_FOUND', 'Investimento não encontrado.');
  }
  return ok(investment);
}
