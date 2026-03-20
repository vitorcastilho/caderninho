'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createIncomeSourceSchema,
  updateIncomeSourceSchema,
  incomeSourceIdSchema,
} from '@/shared/schemas/income-source.schema';
import { incomeSourceDeps } from '@/server/factories/income-source';
import { createIncomeSource } from '@/server/domain/income-sources/use-cases/create-income-source';
import { updateIncomeSource } from '@/server/domain/income-sources/use-cases/update-income-source';
import { archiveIncomeSource } from '@/server/domain/income-sources/use-cases/archive-income-source';
import { reactivateIncomeSource } from '@/server/domain/income-sources/use-cases/reactivate-income-source';
import { listIncomeSources } from '@/server/domain/income-sources/use-cases/list-income-sources';
import { getIncomeSource } from '@/server/domain/income-sources/use-cases/get-income-source';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return null;
  }
  return organizationId;
}

export const createIncomeSourceAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createIncomeSourceSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createIncomeSource(incomeSourceDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateIncomeSourceAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(incomeSourceIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateIncomeSourceSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateIncomeSource(incomeSourceDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveIncomeSourceAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(incomeSourceIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveIncomeSource(incomeSourceDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateIncomeSourceAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(incomeSourceIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateIncomeSource(incomeSourceDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listIncomeSourcesAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listIncomeSources(incomeSourceDeps.repository, { organizationId, includeArchived: true });
});

export const getIncomeSourceAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(incomeSourceIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getIncomeSource(incomeSourceDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
