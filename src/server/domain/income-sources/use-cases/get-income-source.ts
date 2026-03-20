import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface GetIncomeSourceParams {
  id: string;
  organizationId: string;
}

export async function getIncomeSource(
  repository: IncomeSourceRepository,
  params: GetIncomeSourceParams,
): Promise<Result<IncomeSource>> {
  const incomeSource = await repository.findById(params.id, params.organizationId);
  if (!incomeSource) {
    return err('INCOME_SOURCE_NOT_FOUND', 'Fonte de receita não encontrada.');
  }
  return ok(incomeSource);
}
