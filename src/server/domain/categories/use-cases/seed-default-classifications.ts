import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  EssentialityClassification,
  ClassificationRepository,
} from '../repositories/classification.repository';

const DEFAULT_CLASSIFICATIONS = [
  { name: 'Essenciais', displayOrder: 1 },
  { name: 'Qualidade de Vida', displayOrder: 2 },
  { name: 'Investimentos', displayOrder: 3 },
  { name: 'Proteção', displayOrder: 4 },
  { name: 'Doações', displayOrder: 5 },
  { name: 'Impostos e Obrigações', displayOrder: 6 },
  { name: 'Dívidas', displayOrder: 7 },
] as const;

interface SeedDefaultClassificationsParams {
  organizationId: string;
  userId: string;
}

export async function seedDefaultClassifications(
  deps: { repository: ClassificationRepository; auditLogger: AuditLogger },
  params: SeedDefaultClassificationsParams,
): Promise<Result<EssentialityClassification[]>> {
  const existing = await deps.repository.countByOrganization(params.organizationId);
  if (existing > 0) {
    const all = await deps.repository.findAllByOrganization(params.organizationId, true);
    return ok(all);
  }

  const created: EssentialityClassification[] = [];
  for (const def of DEFAULT_CLASSIFICATIONS) {
    const classification = await deps.repository.create({
      id: crypto.randomUUID(),
      name: def.name,
      displayOrder: def.displayOrder,
      organizationId: params.organizationId,
    });
    created.push(classification);
  }

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'SEED',
    entityType: 'essentiality_classification',
    entityId: 'batch',
    oldValue: null,
    newValue: { count: created.length, names: created.map(c => c.name) },
  });

  return ok(created);
}
