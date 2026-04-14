import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

interface DeleteTransactionParams {
  id: string;
  organizationId: string;
  userId: string;
}

interface DeleteTransactionDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
}

export interface DeleteTransactionResult {
  id: string;
  snapshot: Transaction;
}

export async function deleteTransaction(
  deps: DeleteTransactionDeps,
  params: DeleteTransactionParams,
): Promise<Result<DeleteTransactionResult>> {
  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('TRANSACTION_NOT_FOUND', 'Transação não encontrada');
  }

  if (existing.type === 'expense') {
    if (
      (existing.paymentMethodType === 'debit' || existing.paymentMethodType === 'pix') &&
      existing.paymentMethodId
    ) {
      const account = await deps.bankAccountRepository.findById(
        existing.paymentMethodId,
        params.organizationId,
      );
      if (account) {
        await deps.bankAccountRepository.update(account.id, params.organizationId, {
          balanceCents: account.balanceCents + existing.amountCents,
        });
      }
    }
    // crédito: não afeta saldo no MVP
  } else if (existing.type === 'income') {
    if (existing.destinationAccountId) {
      const account = await deps.bankAccountRepository.findById(
        existing.destinationAccountId,
        params.organizationId,
      );
      if (account) {
        await deps.bankAccountRepository.update(account.id, params.organizationId, {
          balanceCents: account.balanceCents - existing.amountCents,
        });
      }
    }
  } else if (existing.type === 'transfer') {
    if (existing.sourceAccountId) {
      const source = await deps.bankAccountRepository.findById(
        existing.sourceAccountId,
        params.organizationId,
      );
      if (source) {
        await deps.bankAccountRepository.update(source.id, params.organizationId, {
          balanceCents: source.balanceCents + existing.amountCents,
        });
      }
    }
    if (existing.destinationAccountId) {
      const destination = await deps.bankAccountRepository.findById(
        existing.destinationAccountId,
        params.organizationId,
      );
      if (destination) {
        await deps.bankAccountRepository.update(destination.id, params.organizationId, {
          balanceCents: destination.balanceCents - existing.amountCents,
        });
      }
    }
  }

  await deps.repository.delete(params.id, params.organizationId);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'DELETE',
    entityType: 'transaction',
    entityId: params.id,
    oldValue: {
      type: existing.type,
      amountCents: existing.amountCents,
      categoryId: existing.categoryId,
      subcategoryId: existing.subcategoryId,
      establishment: existing.establishment,
      paymentMethodType: existing.paymentMethodType,
      paymentMethodId: existing.paymentMethodId,
      installments: existing.installments,
      description: existing.description,
      incomeSourceId: existing.incomeSourceId,
      sourceAccountId: existing.sourceAccountId,
      destinationAccountId: existing.destinationAccountId,
      transactionDate: existing.transactionDate.toISOString(),
      referenceMonth: existing.referenceMonth,
    },
    newValue: null,
  });

  return ok({ id: params.id, snapshot: existing });
}
