'use server';

import { err } from '@/shared/types/result';
import {
  createCreditCardSchema,
  updateCreditCardSchema,
  creditCardIdSchema,
} from '@/shared/schemas/credit-card.schema';
import { createCreditCard } from '@/server/domain/credit-cards/use-cases/create-credit-card';
import { updateCreditCard } from '@/server/domain/credit-cards/use-cases/update-credit-card';
import { archiveCreditCard } from '@/server/domain/credit-cards/use-cases/archive-credit-card';
import { reactivateCreditCard } from '@/server/domain/credit-cards/use-cases/reactivate-credit-card';
import { listCreditCards } from '@/server/domain/credit-cards/use-cases/list-credit-cards';
import { getCreditCard } from '@/server/domain/credit-cards/use-cases/get-credit-card';
import { creditCardDeps } from '@/server/factories/credit-card';
import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return null;
  }
  return organizationId;
}

export const createCreditCardAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createCreditCardSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createCreditCard(creditCardDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateCreditCardAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(creditCardIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateCreditCardSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateCreditCard(creditCardDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveCreditCardAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(creditCardIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveCreditCard(creditCardDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateCreditCardAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(creditCardIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateCreditCard(creditCardDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listCreditCardsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listCreditCards(creditCardDeps.repository, { organizationId, includeArchived: true });
});

export const getCreditCardAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(creditCardIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getCreditCard(creditCardDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
