import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  Investment,
  InvestmentRepository,
} from '../repositories/investment.repository';

interface ListInvestmentsParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listInvestments(
  repository: InvestmentRepository,
  params: ListInvestmentsParams,
): Promise<Result<Investment[]>> {
  const investments = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(investments);
}
