import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';

interface ArchiveClassificationParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function archiveClassification(
  deps: {
    repository: ClassificationRepository;
    categoryRepository: CategoryRepository;
    auditLogger: AuditLogger;
  },
  params: ArchiveClassificationParams,
): Promise<Result<EssentialityClassification>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação não encontrada.');
  }

  if (existing.status === 'archived') {
    return err('CLASSIFICATION_ALREADY_ARCHIVED', 'Esta classificação já está arquivada.');
  }

  const activeCategories = await deps.categoryRepository.countActiveByClassification(
    params.id,
    params.organizationId,
  );

  if (activeCategories > 0) {
    return err(
      'CLASSIFICATION_HAS_ACTIVE_CATEGORIES',
      'Esta classificação possui categorias ativas. Mova-as para outra classificação antes de arquivar.',
    );
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'ARCHIVE',
    entityType: 'essentiality_classification',
    entityId: params.id,
    oldValue: { status: 'active' },
    newValue: { status: 'archived' },
  });

  return ok(archived);
}
