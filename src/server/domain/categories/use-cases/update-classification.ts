import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';

interface UpdateClassificationParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{ name: string; displayOrder: number }>;
}

export async function updateClassification(
  deps: { repository: ClassificationRepository; auditLogger: AuditLogger },
  params: UpdateClassificationParams,
): Promise<Result<EssentialityClassification>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('CLASSIFICATION_NOT_FOUND', 'Classificação não encontrada.');
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'essentiality_classification',
    entityId: params.id,
    oldValue: { name: existing.name, displayOrder: existing.displayOrder },
    newValue: { name: updated.name, displayOrder: updated.displayOrder },
  });

  return ok(updated);
}
