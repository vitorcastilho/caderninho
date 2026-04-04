import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Establishment, EstablishmentRepository } from '../repositories/establishment.repository';
import type { SubcategoryRepository } from '@/server/domain/categories/repositories/subcategory.repository';

interface CreateEstablishmentParams {
  name: string;
  emoji?: string;
  subcategoryId: string;
  defaultPaymentMethodType?: string | null;
  defaultPaymentMethodId?: string | null;
  budgetMinCents?: number | null;
  budgetMaxCents?: number | null;
  organizationId: string;
  userId: string;
}

export async function createEstablishment(
  deps: {
    repository: EstablishmentRepository;
    subcategoryRepository: SubcategoryRepository;
    auditLogger: AuditLogger;
  },
  params: CreateEstablishmentParams,
): Promise<Result<Establishment>> {
  const subcategory = await deps.subcategoryRepository.findById(
    params.subcategoryId,
    params.organizationId,
  );
  if (!subcategory) {
    return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
  }
  if (subcategory.status === 'archived') {
    return err('SUBCATEGORY_ARCHIVED', 'Não é possível criar estabelecimento em uma subcategoria arquivada.');
  }

  const existing = await deps.repository.findByNameAndSubcategory(
    params.name,
    params.subcategoryId,
    params.organizationId,
  );
  if (existing) {
    return err('ESTABLISHMENT_DUPLICATE', 'Já existe um estabelecimento com esse nome nesta subcategoria.');
  }

  const id = crypto.randomUUID();

  const establishment = await deps.repository.create({
    id,
    name: params.name,
    emoji: params.emoji ?? '📍',
    subcategoryId: params.subcategoryId,
    source: 'manual',
    defaultPaymentMethodType: params.defaultPaymentMethodType ?? null,
    defaultPaymentMethodId: params.defaultPaymentMethodId ?? null,
    budgetMinCents: params.budgetMinCents ?? null,
    budgetMaxCents: params.budgetMaxCents ?? null,
    organizationId: params.organizationId,
  });

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'establishment',
    entityId: establishment.id,
    oldValue: null,
    newValue: {
      name: establishment.name,
      emoji: establishment.emoji,
      subcategoryId: establishment.subcategoryId,
      source: establishment.source,
    },
  });

  return ok(establishment);
}
