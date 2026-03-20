import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';

interface MergeClassificationsParams {
  sourceId: string;
  targetId: string;
  organizationId: string;
  userId: string;
}

export async function mergeClassifications(
  deps: {
    classificationRepository: ClassificationRepository;
    categoryRepository: CategoryRepository;
    auditLogger: AuditLogger;
  },
  params: MergeClassificationsParams,
): Promise<Result<{ migratedCount: number }>> {
  if (params.sourceId === params.targetId) {
    return err('INVALID_MERGE', 'Não é possível mesclar uma classificação consigo mesma.');
  }

  const source = await deps.classificationRepository.findById(params.sourceId, params.organizationId);
  if (!source) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação de origem não encontrada.');
  }

  if (source.status === 'archived') {
    return err('CLASSIFICATION_ALREADY_ARCHIVED', 'Esta classificação já está arquivada.');
  }

  const target = await deps.classificationRepository.findById(params.targetId, params.organizationId);
  if (!target) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação de destino não encontrada.');
  }

  if (target.status === 'archived') {
    return err('TARGET_CLASSIFICATION_ARCHIVED', 'A classificação de destino está arquivada.');
  }

  const migratedCount = await deps.categoryRepository.updateClassificationBulk(
    params.sourceId,
    params.targetId,
    params.organizationId,
  );

  await deps.classificationRepository.updateStatus(params.sourceId, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'MERGE',
    entityType: 'essentiality_classification',
    entityId: params.sourceId,
    oldValue: { sourceId: params.sourceId, sourceName: source.name },
    newValue: { targetId: params.targetId, targetName: target.name, migratedCount },
  });

  return ok({ migratedCount });
}
