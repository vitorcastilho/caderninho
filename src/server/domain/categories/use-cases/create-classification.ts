import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';

interface CreateClassificationParams {
  name: string;
  displayOrder: number;
  organizationId: string;
  userId: string;
}

export async function createClassification(
  deps: { repository: ClassificationRepository; auditLogger: AuditLogger },
  params: CreateClassificationParams,
): Promise<Result<EssentialityClassification>> {
  const id = crypto.randomUUID();

  const classification = await deps.repository.create({
    id,
    name: params.name,
    displayOrder: params.displayOrder,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'essentiality_classification',
    entityId: classification.id,
    oldValue: null,
    newValue: { name: classification.name, displayOrder: classification.displayOrder },
  });

  return ok(classification);
}
