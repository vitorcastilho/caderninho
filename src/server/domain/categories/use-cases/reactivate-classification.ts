import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';

interface ReactivateClassificationParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function reactivateClassification(
  deps: { repository: ClassificationRepository; auditLogger: AuditLogger },
  params: ReactivateClassificationParams,
): Promise<Result<EssentialityClassification>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação não encontrada.');
  }

  if (existing.status === 'active') {
    return err('CLASSIFICATION_ALREADY_ACTIVE', 'Esta classificação já está ativa.');
  }

  const reactivated = await deps.repository.updateStatus(params.id, params.organizationId, 'active');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'REACTIVATE',
    entityType: 'essentiality_classification',
    entityId: params.id,
    oldValue: { status: 'archived' },
    newValue: { status: 'active' },
  });

  return ok(reactivated);
}
