import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';

interface UpdateSubcategoryParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{ name: string }>;
}

export async function updateSubcategory(
  deps: { repository: SubcategoryRepository; auditLogger: AuditLogger },
  params: UpdateSubcategoryParams,
): Promise<Result<Subcategory>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'subcategory',
    entityId: params.id,
    oldValue: { name: existing.name },
    newValue: { name: updated.name },
  });

  return ok(updated);
}
