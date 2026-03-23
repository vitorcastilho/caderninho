'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryIdSchema,
} from '@/shared/schemas/subcategory.schema';
import { subcategoryDeps } from '@/server/factories/category';
import { createSubcategory } from '@/server/domain/categories/use-cases/create-subcategory';
import { updateSubcategory } from '@/server/domain/categories/use-cases/update-subcategory';
import { archiveSubcategory } from '@/server/domain/categories/use-cases/archive-subcategory';
import { reactivateSubcategory } from '@/server/domain/categories/use-cases/reactivate-subcategory';
import { listSubcategories } from '@/server/domain/categories/use-cases/list-subcategories';
import { getSubcategory } from '@/server/domain/categories/use-cases/get-subcategory';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

export const createSubcategoryAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createSubcategorySchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createSubcategory(subcategoryDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateSubcategoryAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(subcategoryIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateSubcategorySchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateSubcategory(subcategoryDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveSubcategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(subcategoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveSubcategory(subcategoryDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateSubcategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(subcategoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateSubcategory(subcategoryDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listSubcategoriesAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listSubcategories(subcategoryDeps.repository, { organizationId, includeArchived: true });
});

export const getSubcategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(subcategoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getSubcategory(subcategoryDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
