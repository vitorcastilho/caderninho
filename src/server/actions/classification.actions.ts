'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createClassificationSchema,
  updateClassificationSchema,
  mergeClassificationsSchema,
  classificationIdSchema,
} from '@/shared/schemas/essentiality-classification.schema';
import {
  classificationDeps,
  archiveClassificationDeps,
  mergeDeps,
  listClassificationsDeps,
} from '@/server/factories/category';
import { seedDefaultClassifications } from '@/server/domain/categories/use-cases/seed-default-classifications';
import { createClassification } from '@/server/domain/categories/use-cases/create-classification';
import { updateClassification } from '@/server/domain/categories/use-cases/update-classification';
import { mergeClassifications } from '@/server/domain/categories/use-cases/merge-classifications';
import { archiveClassification } from '@/server/domain/categories/use-cases/archive-classification';
import { reactivateClassification } from '@/server/domain/categories/use-cases/reactivate-classification';
import { listClassifications } from '@/server/domain/categories/use-cases/list-classifications';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const seedDefaultClassificationsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return seedDefaultClassifications(classificationDeps, {
    organizationId,
    userId: session.user.id,
  });
});

export const createClassificationAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createClassificationSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createClassification(classificationDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateClassificationAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(classificationIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateClassificationSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateClassification(classificationDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const mergeClassificationsAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(mergeClassificationsSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return mergeClassifications(mergeDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const archiveClassificationAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(classificationIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveClassification(archiveClassificationDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateClassificationAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(classificationIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateClassification(classificationDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listClassificationsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listClassifications(listClassificationsDeps, {
    organizationId,
    includeArchived: true,
  });
});
