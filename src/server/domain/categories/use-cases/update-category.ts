import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';

interface UpdateCategoryParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    classificationId: string;
    budgetMinCents: number | null;
    budgetMaxCents: number | null;
  }>;
}

export async function updateCategory(
  deps: {
    repository: CategoryRepository;
    classificationRepository: ClassificationRepository;
    auditLogger: AuditLogger;
  },
  params: UpdateCategoryParams,
): Promise<Result<Category>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }

  if (params.data.classificationId && params.data.classificationId !== existing.classificationId) {
    const classification = await deps.classificationRepository.findById(
      params.data.classificationId,
      params.organizationId,
    );
    if (!classification) {
      return err('CLASSIFICATION_NOT_FOUND', 'Classificação de essencialidade não encontrada.');
    }
    if (classification.status === 'archived') {
      return err('CLASSIFICATION_ARCHIVED', 'Não é possível mover categoria para uma classificação arquivada.');
    }
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'category',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      classificationId: existing.classificationId,
      budgetMinCents: existing.budgetMinCents,
      budgetMaxCents: existing.budgetMaxCents,
    },
    newValue: {
      name: updated.name,
      classificationId: updated.classificationId,
      budgetMinCents: updated.budgetMinCents,
      budgetMaxCents: updated.budgetMaxCents,
    },
  });

  return ok(updated);
}
