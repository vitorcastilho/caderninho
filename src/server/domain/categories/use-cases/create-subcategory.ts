import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';
import type { CategoryRepository } from '../repositories/category.repository';

interface CreateSubcategoryParams {
  name: string;
  categoryId: string;
  organizationId: string;
  userId: string;
}

export async function createSubcategory(
  deps: {
    repository: SubcategoryRepository;
    categoryRepository: CategoryRepository;
    auditLogger: AuditLogger;
  },
  params: CreateSubcategoryParams,
): Promise<Result<Subcategory>> {
  const category = await deps.categoryRepository.findById(
    params.categoryId,
    params.organizationId,
  );
  if (!category) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }
  if (category.status === 'archived') {
    return err('CATEGORY_ARCHIVED', 'Não é possível criar subcategoria em uma categoria arquivada.');
  }

  const id = crypto.randomUUID();

  const subcategory = await deps.repository.create({
    id,
    name: params.name,
    categoryId: params.categoryId,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'subcategory',
    entityId: subcategory.id,
    oldValue: null,
    newValue: { name: subcategory.name, categoryId: subcategory.categoryId },
  });

  return ok(subcategory);
}
