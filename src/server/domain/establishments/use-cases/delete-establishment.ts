import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Establishment, EstablishmentRepository } from '../repositories/establishment.repository';

interface DeleteEstablishmentParams {
  id: string;
  organizationId: string;
  userId: string;
}

export async function deleteEstablishment(
  deps: {
    repository: EstablishmentRepository;
    auditLogger: AuditLogger;
  },
  params: DeleteEstablishmentParams,
): Promise<Result<Establishment>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('ESTABLISHMENT_NOT_FOUND', 'Estabelecimento não encontrado.');
  }

  const archived = await deps.repository.updateStatus(params.id, params.organizationId, 'archived');

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'DELETE',
    entityType: 'establishment',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      emoji: existing.emoji,
      subcategoryId: existing.subcategoryId,
      status: existing.status,
    },
    newValue: {
      status: 'archived',
    },
  });

  return ok(archived);
}
