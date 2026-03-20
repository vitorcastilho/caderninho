import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Category, CategoryRepository } from '../repositories/category.repository';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';

interface ArchiveCategoryParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveCategory(
  deps: {
    repository: CategoryRepository;
    subcategoryRepository: SubcategoryRepository;
    auditLogger: AuditLogger;
  },
  params: ArchiveCategoryParams,
): Promise<Result<Category>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CATEGORY_NOT_FOUND', 'Categoria não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('CATEGORY_ALREADY_ARCHIVED', 'Esta categoria já está arquivada.');
  }

  const activeSubcategories = await deps.subcategoryRepository.countActiveByCategory(
    params.id,
    params.organizationId,
  );

  if (activeSubcategories > 0) {
    return err(
      'CATEGORY_HAS_ACTIVE_SUBCATEGORIES',
      'Esta categoria possui subcategorias ativas. Arquive-as primeiro.',
    );
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'category',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
