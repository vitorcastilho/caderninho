import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Establishment, EstablishmentRepository } from '../repositories/establishment.repository';

interface ListEstablishmentsBySubcategoryParams {
  subcategoryId: string;
  organizationId: string;
}

export async function listEstablishmentsBySubcategory(
  deps: {
    repository: EstablishmentRepository;
  },
  params: ListEstablishmentsBySubcategoryParams,
): Promise<Result<Establishment[]>> {
  const establishments = await deps.repository.findBySubcategory(
    params.subcategoryId,
    params.organizationId,
  );

  return ok(establishments);
}
