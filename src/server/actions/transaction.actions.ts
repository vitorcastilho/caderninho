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
  recreateTransactionSnapshotSchema,
  getImpactPreviewSchema,
  getMonthlySpendingSummarySchema,
  listTransactionsFilterSchema,
  transactionPeriodSummaryFilterSchema,
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
import { listTransactions } from '@/server/domain/transactions/use-cases/list-transactions';
import { getTransactionPeriodSummary } from '@/server/domain/transactions/use-cases/get-transaction-period-summary';
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

export const listTransactionsAction = withAuth(async (session, input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const normalizedInput = input ?? {};
  const validation = validateInput(listTransactionsFilterSchema, normalizedInput);
  if (!validation.success) return validation;

  const { limit, offset, ...filters } = validation.data;

  return listTransactions(
    { repository: transactionDeps.repository },
    {
      organizationId,
      filters,
      pagination: { limit, offset },
    },
  );
});

export const getTransactionPeriodSummaryAction = withAuth(async (session, input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const normalizedInput = input ?? {};
  const validation = validateInput(transactionPeriodSummaryFilterSchema, normalizedInput);
  if (!validation.success) return validation;

  return getTransactionPeriodSummary(
    { repository: transactionDeps.repository },
    {
      organizationId,
      filters: validation.data,
    },
  );
});

/**
 * Recria uma transação a partir de um snapshot capturado durante o delete
 * (usado pelo "Desfazer" do toast de exclusão).
 *
 * Endurecimentos aplicados:
 * - Validação forte via zod (campos obrigatórios + tipos)
 * - Ownership checks: todas as FKs (category/subcategory/incomeSource + contas
 *   bancárias / cartões) precisam pertencer à organização ativa
 * - Idempotência: se a transação já existe (clique duplo em <5s), retorna
 *   sucesso sem reaplicar saldo
 * - createdBy é forçado a partir da session, nunca confia no cliente
 * - Tudo dentro de db.transaction() para atomicidade saldo ↔ transação
 */
export const recreateTransactionFromSnapshotAction = withAuth(async (session, input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  const validation = validateInput(recreateTransactionSnapshotSchema, input);
  if (!validation.success) return validation;

  const snapshot = validation.data;

  // HIGH 3 — idempotência: se já existe, devolve o existente sem reaplicar saldo.
  // findById filtra por organizationId, logo também cobre tentativa de uso
  // cross-org de um id arbitrário.
  const existing = await transactionDeps.repository.findById(snapshot.id, organizationId);
  if (existing) {
    return { success: true as const, data: existing };
  }

  // Ownership checks: toda FK referenciada precisa pertencer à org ativa.
  if (snapshot.categoryId) {
    const category = await transactionDeps.categoryRepository.findById(
      snapshot.categoryId,
      organizationId,
    );
    if (!category) return err('INVALID_SNAPSHOT', 'Categoria não pertence à organização');
  }
  if (snapshot.subcategoryId) {
    const subcategory = await transactionDeps.subcategoryRepository.findById(
      snapshot.subcategoryId,
      organizationId,
    );
    if (!subcategory) return err('INVALID_SNAPSHOT', 'Subcategoria não pertence à organização');
  }
  if (snapshot.incomeSourceId) {
    const src = await transactionDeps.incomeSourceRepository.findById(
      snapshot.incomeSourceId,
      organizationId,
    );
    if (!src) return err('INVALID_SNAPSHOT', 'Fonte de receita não pertence à organização');
  }
  if (
    snapshot.paymentMethodId &&
    (snapshot.paymentMethodType === 'debit' || snapshot.paymentMethodType === 'pix')
  ) {
    const acc = await transactionDeps.bankAccountRepository.findById(
      snapshot.paymentMethodId,
      organizationId,
    );
    if (!acc) return err('INVALID_SNAPSHOT', 'Conta de pagamento não pertence à organização');
  }
  if (snapshot.paymentMethodId && snapshot.paymentMethodType === 'credit') {
    const card = await transactionDeps.creditCardRepository.findById(
      snapshot.paymentMethodId,
      organizationId,
    );
    if (!card) return err('INVALID_SNAPSHOT', 'Cartão de crédito não pertence à organização');
  }
  if (snapshot.sourceAccountId) {
    const acc = await transactionDeps.bankAccountRepository.findById(
      snapshot.sourceAccountId,
      organizationId,
    );
    if (!acc) return err('INVALID_SNAPSHOT', 'Conta de origem não pertence à organização');
  }
  if (snapshot.destinationAccountId) {
    const acc = await transactionDeps.bankAccountRepository.findById(
      snapshot.destinationAccountId,
      organizationId,
    );
    if (!acc) return err('INVALID_SNAPSHOT', 'Conta de destino não pertence à organização');
  }

  // Tudo atomicamente dentro de db.transaction()
  const recreated = await transactionDeps.withTransaction(async (tx) => {
    const created = await tx.repository.create({
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
      transactionDate: snapshot.transactionDate,
      referenceMonth: snapshot.referenceMonth,
      organizationId,
      // MED 4: createdBy vem da session, nunca do cliente
      createdBy: session.user.id,
    });

    // Reaplicar o impacto no saldo (inverso do estorno feito no delete).
    if (created.type === 'expense') {
      if (
        (created.paymentMethodType === 'debit' || created.paymentMethodType === 'pix') &&
        created.paymentMethodId
      ) {
        const account = await tx.bankAccountRepository.findById(
          created.paymentMethodId,
          organizationId,
        );
        if (account) {
          await tx.bankAccountRepository.update(account.id, organizationId, {
            balanceCents: account.balanceCents - created.amountCents,
          });
        }
      }
    } else if (created.type === 'income') {
      if (created.destinationAccountId) {
        const account = await tx.bankAccountRepository.findById(
          created.destinationAccountId,
          organizationId,
        );
        if (account) {
          await tx.bankAccountRepository.update(account.id, organizationId, {
            balanceCents: account.balanceCents + created.amountCents,
          });
        }
      }
    } else if (created.type === 'transfer') {
      if (created.sourceAccountId) {
        const source = await tx.bankAccountRepository.findById(
          created.sourceAccountId,
          organizationId,
        );
        if (source) {
          await tx.bankAccountRepository.update(source.id, organizationId, {
            balanceCents: source.balanceCents - created.amountCents,
          });
        }
      }
      if (created.destinationAccountId) {
        const destination = await tx.bankAccountRepository.findById(
          created.destinationAccountId,
          organizationId,
        );
        if (destination) {
          await tx.bankAccountRepository.update(destination.id, organizationId, {
            balanceCents: destination.balanceCents + created.amountCents,
          });
        }
      }
    }

    return created;
  });

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
