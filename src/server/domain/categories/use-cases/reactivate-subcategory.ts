import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';

interface ReactivateSubcategoryParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateSubcategory(
  deps: { repository: SubcategoryRepository; auditLogger: AuditLogger },
  params: ReactivateSubcategoryParams,
): Promise<Result<Subcategory>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }

  if (existing.status === 'active') {
    return err('SUBCATEGORY_ALREADY_ACTIVE', 'Esta subcategoria já está ativa.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'subcategory',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
