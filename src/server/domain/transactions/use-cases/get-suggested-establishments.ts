import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { TransactionRepository } from '../repositories/transaction.repository';

interface GetSuggestedEstablishmentsParams {
  subcategoryId: string;
  organizationId: string;
}

export async function getSuggestedEstablishments(
  repository: TransactionRepository,
  params: GetSuggestedEstablishmentsParams,
): Promise<Result<string[]>> {
  const establishments = await repository.findTopEstablishments(
    params.subcategoryId,
    params.organizationId,
    5,
    90,
  );

  return ok(establishments);
}
