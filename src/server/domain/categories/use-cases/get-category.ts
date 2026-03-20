import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Category, CategoryRepository } from '../repositories/category.repository';

interface GetCategoryParams {
  id: string;
  organizationId: string;
}

export async function getCategory(
  repository: CategoryRepository,
  params: GetCategoryParams,
): Promise<Result<Category>> {
  const category = await repository.findById(params.id, params.organizationId);
  if (!category) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }
  return ok(category);
}
