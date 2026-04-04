import { ok } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { Establishment, EstablishmentRepository } from '../repositories/establishment.repository';

interface AutoCreateEstablishmentParams {
  name: string;
  subcategoryId: string;
  organizationId: string;
}

export async function autoCreateEstablishment(
  deps: {
    repository: EstablishmentRepository;
  },
  params: AutoCreateEstablishmentParams,
): Promise<Result<Establishment>> {
  const existing = await deps.repository.findByNameAndSubcategory(
    params.name,
    params.subcategoryId,
    params.organizationId,
  );

  if (existing) {
    const updated = await deps.repository.incrementVisitCount(existing.id, params.organizationId);
    return ok(updated);
  }

  const id = crypto.randomUUID();

  const establishment = await deps.repository.create({
    id,
    name: params.name,
    emoji: '📍',
    subcategoryId: params.subcategoryId,
    source: 'auto',
    organizationId: params.organizationId,
  });

  return ok(establishment);
}
