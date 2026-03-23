import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Category, CategoryRepository } from '../repositories/category.repository';

interface ListCategoriesParams {
  organizationId: string;
  includeArchived?: boolean;
}

export async function listCategories(
  repository: CategoryRepository,
  params: ListCategoriesParams,
): Promise<Result<Category[]>> {
  const categories = await repository.findAllByOrganization(
    params.organizationId,
    params.includeArchived,
  );
  return ok(categories);
}
