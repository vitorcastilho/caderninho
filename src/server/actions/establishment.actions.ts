'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentIdSchema,
} from '@/shared/schemas/establishment.schema';
import { idSchema } from '@/shared/schemas/common.schema';
import { establishmentDeps, listEstablishmentsDeps } from '@/server/factories/establishment';
import { createEstablishment } from '@/server/domain/establishments/use-cases/create-establishment';
import { updateEstablishment } from '@/server/domain/establishments/use-cases/update-establishment';
import { deleteEstablishment } from '@/server/domain/establishments/use-cases/delete-establishment';
import { listEstablishmentsBySubcategory } from '@/server/domain/establishments/use-cases/list-establishments-by-subcategory';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

export const createEstablishmentAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createEstablishmentSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createEstablishment(establishmentDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateEstablishmentAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(establishmentIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateEstablishmentSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateEstablishment(establishmentDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const deleteEstablishmentAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(establishmentIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return deleteEstablishment(establishmentDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const listEstablishmentsBySubcategoryAction = withAuth(
  async (session, input: { subcategoryId: unknown }) => {
    const validation = validateInput(idSchema, input.subcategoryId);
    if (!validation.success) return validation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return listEstablishmentsBySubcategory(listEstablishmentsDeps, {
      subcategoryId: validation.data,
      organizationId,
    });
  },
);
