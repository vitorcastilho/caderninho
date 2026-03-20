import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type {
  IncomeSource,
  IncomeSourceRepository,
} from '../repositories/income-source.repository';

interface ListIncomeSourcesParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listIncomeSources(
  repository: IncomeSourceRepository,
  params: ListIncomeSourcesParams,
): Promise<Result<IncomeSource[]>> {
  const incomeSources = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(incomeSources);
}
