import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Subcategory, SubcategoryRepository } from '../repositories/subcategory.repository';

interface ArchiveSubcategoryParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveSubcategory(
  deps: { repository: SubcategoryRepository; auditLogger: AuditLogger },
  params: ArchiveSubcategoryParams,
): Promise<Result<Subcategory>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('SUBCATEGORY_ALREADY_ARCHIVED', 'Esta subcategoria já está arquivada.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'subcategory',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
