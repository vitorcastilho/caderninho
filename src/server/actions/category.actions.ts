'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from '@/shared/schemas/category.schema';
import { categoryDeps, archiveCategoryDeps } from '@/server/factories/category';
import { createCategory } from '@/server/domain/categories/use-cases/create-category';
import { updateCategory } from '@/server/domain/categories/use-cases/update-category';
import { archiveCategory } from '@/server/domain/categories/use-cases/archive-category';
import { reactivateCategory } from '@/server/domain/categories/use-cases/reactivate-category';
import { listCategories } from '@/server/domain/categories/use-cases/list-categories';
import { getCategory } from '@/server/domain/categories/use-cases/get-category';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

export const createCategoryAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createCategorySchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createCategory(categoryDeps, {
    ...validation.data,
    budgetMinCents: validation.data.budgetMinCents ?? null,
    budgetMaxCents: validation.data.budgetMaxCents ?? null,
    organizationId,
    userId: session.user.id,
  });
});

export const updateCategoryAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(categoryIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateCategorySchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateCategory(categoryDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveCategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(categoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveCategory(archiveCategoryDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateCategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(categoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateCategory(categoryDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listCategoriesAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listCategories(categoryDeps.repository, { organizationId, includeArchived: true });
});

export const getCategoryAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(categoryIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getCategory(categoryDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
