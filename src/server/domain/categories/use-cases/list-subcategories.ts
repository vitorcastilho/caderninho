import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';

interface ListSubcategoriesParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listSubcategories(
  repository: SubcategoryRepository,
  params: ListSubcategoriesParams,
): Promise<Result<Subcategory[]>> {
  const subcategories = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(subcategories);
}
