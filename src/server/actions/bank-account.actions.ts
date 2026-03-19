'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdSchema,
} from '@/shared/schemas/bank-account.schema';
import { bankAccountDeps } from '@/server/factories/bank-account';
import { createBankAccount } from '@/server/domain/bank-accounts/use-cases/create-bank-account';
import { updateBankAccount } from '@/server/domain/bank-accounts/use-cases/update-bank-account';
import { archiveBankAccount } from '@/server/domain/bank-accounts/use-cases/archive-bank-account';
import { reactivateBankAccount } from '@/server/domain/bank-accounts/use-cases/reactivate-bank-account';
import { listBankAccounts } from '@/server/domain/bank-accounts/use-cases/list-bank-accounts';
import { getBankAccount } from '@/server/domain/bank-accounts/use-cases/get-bank-account';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return null;
  }
  return organizationId;
}

export const createBankAccountAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createBankAccountSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return createBankAccount(bankAccountDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const updateBankAccountAction = withAuth(
  async (session, input: { id: unknown; data: unknown }) => {
    const idValidation = validateInput(bankAccountIdSchema, input.id);
    if (!idValidation.success) return idValidation;

    const dataValidation = validateInput(updateBankAccountSchema, input.data);
    if (!dataValidation.success) return dataValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return updateBankAccount(bankAccountDeps, {
      id: idValidation.data,
      organizationId,
      userId: session.user.id,
      data: dataValidation.data,
    });
  },
);

export const archiveBankAccountAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(bankAccountIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return archiveBankAccount(bankAccountDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

export const reactivateBankAccountAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(bankAccountIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return reactivateBankAccount(bankAccountDeps, {
    id: idValidation.data,
    organizationId,
    userId: session.user.id,
  });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listBankAccountsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return listBankAccounts(bankAccountDeps.repository, { organizationId, includeArchived: true });
});

export const getBankAccountAction = withAuth(async (session, input: { id: unknown }) => {
  const idValidation = validateInput(bankAccountIdSchema, input.id);
  if (!idValidation.success) return idValidation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return getBankAccount(bankAccountDeps.repository, {
    id: idValidation.data,
    organizationId,
  });
});
