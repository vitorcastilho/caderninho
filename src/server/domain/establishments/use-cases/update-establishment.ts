import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { Establishment, EstablishmentRepository } from '../repositories/establishment.repository';
import type { SubcategoryRepository } from '@/server/domain/categories/repositories/subcategory.repository';

interface UpdateEstablishmentParams {
  id: string;
  organizationId: string;
  userId: string;
  data: Partial<{
    name: string;
    emoji: string;
    subcategoryId: string;
  }>;
}

export async function updateEstablishment(
  deps: {
    repository: EstablishmentRepository;
    subcategoryRepository: SubcategoryRepository;
    auditLogger: AuditLogger;
  },
  params: UpdateEstablishmentParams,
): Promise<Result<Establishment>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('ESTABLISHMENT_NOT_FOUND', 'Estabelecimento não encontrado.');
  }

  if (params.data.subcategoryId && params.data.subcategoryId !== existing.subcategoryId) {
    const subcategory = await deps.subcategoryRepository.findById(
      params.data.subcategoryId,
      params.organizationId,
    );
    if (!subcategory) {
      return err('SUBCATEGORY_NOT_FOUND', 'Subcategoria não encontrada.');
    }
    if (subcategory.status === 'archived') {
      return err('SUBCATEGORY_ARCHIVED', 'Não é possível mover estabelecimento para uma subcategoria arquivada.');
    }
  }

  if (params.data.name && params.data.name !== existing.name) {
    const targetSubcategoryId = params.data.subcategoryId ?? existing.subcategoryId;
    const duplicate = await deps.repository.findByNameAndSubcategory(
      params.data.name,
      targetSubcategoryId,
      params.organizationId,
    );
    if (duplicate && duplicate.id !== params.id) {
      return err('ESTABLISHMENT_DUPLICATE', 'Já existe um estabelecimento com esse nome nesta subcategoria.');
    }
  }

  const updated = await deps.repository.update(params.id, params.organizationId, params.data);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'establishment',
    entityId: params.id,
    oldValue: {
      name: existing.name,
      emoji: existing.emoji,
      subcategoryId: existing.subcategoryId,
    },
    newValue: {
      name: updated.name,
      emoji: updated.emoji,
      subcategoryId: updated.subcategoryId,
    },
  });

  return ok(updated);
}
