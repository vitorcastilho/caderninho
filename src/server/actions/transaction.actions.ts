'use server';

import { revalidatePath } from 'next/cache';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { validateInput } from '@/server/infrastructure/validation/validate';
import { err } from '@/shared/types/result';
import {
  createTransactionSchema,
  createIncomeSchema,
  createTransferSchema,
  updateExpenseSchema,
  deleteTransactionSchema,
  getImpactPreviewSchema,
  getMonthlySpendingSummarySchema,
} from '@/shared/schemas/transaction.schema';
import { idSchema } from '@/shared/schemas/common.schema';
import { transactionDeps } from '@/server/factories/transaction';
import { autoCreateEstablishmentDeps } from '@/server/factories/establishment';
import { createTransaction } from '@/server/domain/transactions/use-cases/create-transaction';
import { createIncome } from '@/server/domain/transactions/use-cases/create-income';
import { transferBetweenAccounts } from '@/server/domain/transactions/use-cases/transfer-between-accounts';
import { updateExpenseTransaction } from '@/server/domain/transactions/use-cases/update-expense-transaction';
import { deleteTransaction } from '@/server/domain/transactions/use-cases/delete-transaction';
import { getSuggestedEstablishments } from '@/server/domain/transactions/use-cases/get-suggested-establishments';
import { getImpactPreview } from '@/server/domain/transactions/use-cases/get-impact-preview';
import { createGetMonthlySpendingSummary } from '@/server/domain/transactions/use-cases/get-monthly-spending-summary';
import { autoCreateEstablishment } from '@/server/domain/establishments/use-cases/auto-create-establishment';
import type { Transaction } from '@/server/domain/transactions/repositories/transaction.repository';

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

export const createIncomeAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createIncomeSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const result = await createIncome(transactionDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
  }

  return result;
});

export const updateExpenseTransactionAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(updateExpenseSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const result = await updateExpenseTransaction(transactionDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
  }

  return result;
});

export const deleteTransactionAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(deleteTransactionSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const result = await deleteTransaction(transactionDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
  }

  return result;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const listTransactionsAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const transactions = await transactionDeps.repository.findByOrganization(organizationId);
  return { success: true as const, data: transactions };
});

/**
 * Recria uma transação a partir de um snapshot (usado pelo "Desfazer" da exclusão).
 * Bypass de validações de negócio pois o snapshot já representa uma transação
 * que foi válida no momento da criação.
 */
export const recreateTransactionFromSnapshotAction = withAuth(async (session, input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const snapshot = input as Transaction | null;
  if (!snapshot || typeof snapshot !== 'object' || !snapshot.id || !snapshot.type) {
    return err('INVALID_SNAPSHOT', 'Snapshot inválido');
  }
  if (snapshot.organizationId !== organizationId) {
    return err('INVALID_SNAPSHOT', 'Snapshot pertence a outra organização');
  }

  const transactionDate =
    snapshot.transactionDate instanceof Date
      ? snapshot.transactionDate
      : new Date(snapshot.transactionDate);

  const recreated = await transactionDeps.repository.create({
    id: snapshot.id,
    type: snapshot.type,
    amountCents: snapshot.amountCents,
    categoryId: snapshot.categoryId,
    subcategoryId: snapshot.subcategoryId,
    establishment: snapshot.establishment,
    paymentMethodType: snapshot.paymentMethodType,
    paymentMethodId: snapshot.paymentMethodId,
    installments: snapshot.installments,
    description: snapshot.description,
    incomeSourceId: snapshot.incomeSourceId,
    sourceAccountId: snapshot.sourceAccountId,
    destinationAccountId: snapshot.destinationAccountId,
    transactionDate,
    referenceMonth: snapshot.referenceMonth,
    organizationId,
    createdBy: snapshot.createdBy,
  });

  // Reaplicar impacto no saldo (inverso da reversão feita no delete)
  if (recreated.type === 'expense') {
    if (
      (recreated.paymentMethodType === 'debit' || recreated.paymentMethodType === 'pix') &&
      recreated.paymentMethodId
    ) {
      const account = await transactionDeps.bankAccountRepository.findById(
        recreated.paymentMethodId,
        organizationId,
      );
      if (account) {
        await transactionDeps.bankAccountRepository.update(account.id, organizationId, {
          balanceCents: account.balanceCents - recreated.amountCents,
        });
      }
    }
  } else if (recreated.type === 'income') {
    if (recreated.destinationAccountId) {
      const account = await transactionDeps.bankAccountRepository.findById(
        recreated.destinationAccountId,
        organizationId,
      );
      if (account) {
        await transactionDeps.bankAccountRepository.update(account.id, organizationId, {
          balanceCents: account.balanceCents + recreated.amountCents,
        });
      }
    }
  } else if (recreated.type === 'transfer') {
    if (recreated.sourceAccountId) {
      const source = await transactionDeps.bankAccountRepository.findById(
        recreated.sourceAccountId,
        organizationId,
      );
      if (source) {
        await transactionDeps.bankAccountRepository.update(source.id, organizationId, {
          balanceCents: source.balanceCents - recreated.amountCents,
        });
      }
    }
    if (recreated.destinationAccountId) {
      const destination = await transactionDeps.bankAccountRepository.findById(
        recreated.destinationAccountId,
        organizationId,
      );
      if (destination) {
        await transactionDeps.bankAccountRepository.update(destination.id, organizationId, {
          balanceCents: destination.balanceCents + recreated.amountCents,
        });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/dashboard');
  revalidatePath('/accounts');

  return { success: true as const, data: recreated };
});

export const createTransferAction = withAuth(async (session, input: unknown) => {
  const validation = validateInput(createTransferSchema, input);
  if (!validation.success) return validation;

  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const result = await transferBetweenAccounts(transactionDeps, {
    ...validation.data,
    organizationId,
    userId: session.user.id,
  });

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');
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
  async (session, input: unknown) => {
    const validation = validateInput(getMonthlySpendingSummarySchema, input);
    if (!validation.success) return validation;

    const organizationId = getOrganizationId(session);
    if (!organizationId) {
      return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
    }

    const getSpendingSummary = createGetMonthlySpendingSummary(transactionDeps.repository);
    const result = await getSpendingSummary({
      organizationId,
      year: validation.data.year,
      month: validation.data.month,
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
