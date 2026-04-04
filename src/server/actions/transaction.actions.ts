'use server';

import { revalidatePath } from 'next/cache';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createTransactionSchema,
  transactionIdSchema,
} from '@/shared/schemas/transaction.schema';
import { idSchema } from '@/shared/schemas/common.schema';
import { transactionDeps } from '@/server/factories/transaction';
import { createTransaction } from '@/server/domain/transactions/use-cases/create-transaction';
import { getSuggestedEstablishments } from '@/server/domain/transactions/use-cases/get-suggested-establishments';
import { getImpactPreview } from '@/server/domain/transactions/use-cases/get-impact-preview';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return null;
  }
  return organizationId;
}

export const createTransactionAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createTransactionSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const result = await createTransaction(transactionDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/transactions');
  }

  return result;
});

export const getSuggestedEstablishmentsAction = withAuth(
  async (session, input: { subcategoryId: unknown }) => {
    const validation = validateInput(idSchema, input.subcategoryId);
    if (!validation.success) return validation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return getSuggestedEstablishments(transactionDeps.repository, {
      subcategoryId: validation.data,
      organizationId,
    });
  },
);

export const getImpactPreviewAction = withAuth(
  async (
    session,
    input: {
      amountCents: unknown;
      paymentMethodType: unknown;
      paymentMethodId?: unknown;
      categoryId: unknown;
      categoryName: unknown;
      categoryBudgetCents: unknown;
      paymentMethodLabel: unknown;
    },
  ) => {
    const amountValidation = validateInput(
      createTransactionSchema.shape.amountCents,
      input.amountCents,
    );
    if (!amountValidation.success) return amountValidation;

    const categoryValidation = validateInput(idSchema, input.categoryId);
    if (!categoryValidation.success) return categoryValidation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    return getImpactPreview(
      {
        bankAccountRepository: transactionDeps.bankAccountRepository,
        transactionRepository: transactionDeps.repository,
      },
      {
        amountCents: amountValidation.data,
        paymentMethodType: input.paymentMethodType as string,
        paymentMethodId: input.paymentMethodId as string | undefined,
        categoryId: categoryValidation.data,
        categoryName: input.categoryName as string,
        categoryBudgetCents: input.categoryBudgetCents as number,
        paymentMethodLabel: input.paymentMethodLabel as string,
        organizationId,
      },
    );
  },
);
