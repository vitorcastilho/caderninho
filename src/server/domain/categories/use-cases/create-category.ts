import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';

interface CreateCategoryParams {
  name: string;
  classificationId: string;
  budgetMinCents: number | null;
  budgetMaxCents: number | null;
  organizationId: string;
  userId: string;
}

export async function createCategory(
  deps: {
    repository: CategoryRepository;
    classificationRepository: ClassificationRepository;
    auditLogger: AuditLogger;
  },
  params: CreateCategoryParams,
): Promise<Result<Category>> {
  const classification = await deps.classificationRepository.findById(
    params.classificationId,
    params.organizationId,
  );
  if (!classification) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação de essencialidade não encontrada.');
  }
  if (classification.status === 'archived') {
    return err('CLASSIFICATION_ARCHIVED', 'Não é possível criar categoria em uma classificação arquivada.');
  }

  const id = crypto.randomUUID();

  const category = await deps.repository.create({
    id,
    name: params.name,
    classificationId: params.classificationId,
    budgetMinCents: params.budgetMinCents,
    budgetMaxCents: params.budgetMaxCents,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'category',
    entityId: category.id,
    oldValue: null,
    newValue: {
      name: category.name,
      classificationId: category.classificationId,
      budgetMinCents: category.budgetMinCents,
      budgetMaxCents: category.budgetMaxCents,
    },
  });

  return ok(category);
}
