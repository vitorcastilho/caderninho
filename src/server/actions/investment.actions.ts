'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createInvestmentSchema,
  updateInvestmentSchema,
  investmentIdSchema,
} from '@/shared/schemas/investment.schema';
import { investmentDeps } from '@/server/factories/investment';
import { createInvestment } from '@/server/domain/investments/use-cases/create-investment';
import { updateInvestment } from '@/server/domain/investments/use-cases/update-investment';
import { archiveInvestment } from '@/server/domain/investments/use-cases/archive-investment';
import { reactivateInvestment } from '@/server/domain/investments/use-cases/reactivate-investment';
import { listInvestments } from '@/server/domain/investments/use-cases/list-investments';
import { getInvestment } from '@/server/domain/investments/use-cases/get-investment';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return null;
  }
  return organizationId;
}

export const createInvestmentAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createInvestmentSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createInvestment(investmentDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateInvestmentAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(investmentIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateInvestmentSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateInvestment(investmentDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveInvestmentAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(investmentIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveInvestment(investmentDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateInvestmentAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(investmentIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateInvestment(investmentDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listInvestmentsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listInvestments(investmentDeps.repository, { organizationId, includeArchived: true });
});

export const getInvestmentAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(investmentIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getInvestment(investmentDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
