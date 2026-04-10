'use server';

import { revalidatePath } from 'next/cache';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createTransactionSchema,
  getImpactPreviewSchema,
} from '@/shared/schemas/transaction.schema';
import { idSchema } from '@/shared/schemas/common.schema';
import { transactionDeps } from '@/server/factories/transaction';
import { autoCreateEstablishmentDeps } from '@/server/factories/establishment';
import { createTransaction } from '@/server/domain/transactions/use-cases/create-transaction';
import { getSuggestedEstablishments } from '@/server/domain/transactions/use-cases/get-suggested-establishments';
import { getImpactPreview } from '@/server/domain/transactions/use-cases/get-impact-preview';
import { createGetMonthlySpendingSummary } from '@/server/domain/transactions/use-cases/get-monthly-spending-summary';
import { autoCreateEstablishment } from '@/server/domain/establishments/use-cases/auto-create-establishment';

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
    // Auto-criar estabelecimento se nome e subcategoria foram informados
    if (validation.data.establishment && validation.data.subcategoryId) {
      autoCreateEstablishment(autoCreateEstablishmentDeps, {
        name: validation.data.establishment,
        subcategoryId: validation.data.subcategoryId,
        organizationId,
      }).catch(() => {
        // Falha na auto-criação não deve impedir a transação
      });
    }

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
  async (session, input: unknown) => {
    const validation = validateInput(getImpactPreviewSchema, input);
    if (!validation.success) return validation;

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
        ...validation.data,
        organizationId,
      },
    );
  },
);

export const getMonthlySpendingSummaryAction = withAuth(
  async (session, input: { year: number; month: number }) => {
    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    const getSpendingSummary = createGetMonthlySpendingSummary(transactionDeps.repository);
    const result = await getSpendingSummary({
      organizationId,
      year: input.year,
      month: input.month,
    });

    if (!result.success) return result;

    // Serializar Maps para arrays (Maps não são serializáveis via Server Actions)
    return {
      success: true as const,
      data: {
        byCategory: Array.from(result.data.byCategory.entries()).map(([id, total]) => ({
          id,
          totalCents: total,
        })),
        bySubcategory: Array.from(result.data.bySubcategory.entries()).map(([id, total]) => ({
          id,
          totalCents: total,
        })),
        byEstablishment: Array.from(result.data.byEstablishment.entries()).map(([key, total]) => ({
          key,
          totalCents: total,
        })),
      },
    };
  },
);
