import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';

interface GetSubcategoryParams {
  id: string;
  organizationId: string;
}

export async function getSubcategory(
  repository: SubcategoryRepository,
  params: GetSubcategoryParams,
): Promise<Result<Subcategory>> {
  const subcategory = await repository.findById(params.id, params.organizationId);
  if (!subcategory) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }
  return ok(subcategory);
}
