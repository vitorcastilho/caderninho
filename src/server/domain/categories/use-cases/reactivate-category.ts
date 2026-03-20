import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';

interface ReactivateCategoryParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateCategory(
  deps: { repository: CategoryRepository; auditLogger: AuditLogger },
  params: ReactivateCategoryParams,
): Promise<Result<Category>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }

  if (existing.status === 'active') {
    return err('CATEGORY_ALREADY_ACTIVE', 'Esta categoria já está ativa.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'category',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
