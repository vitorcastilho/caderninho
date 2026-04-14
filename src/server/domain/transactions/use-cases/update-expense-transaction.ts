import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

interface UpdateExpenseTransactionParams {
  id: string;
  amountCents?: number;
  categoryId?: string;
  subcategoryId?: string;
  establishment?: string;
  paymentMethodType?: string;
  paymentMethodId?: string;
  installments?: number;
  description?: string;
  transactionDate?: Date;
  organizationId: string;
  userId: string;
}

interface UpdateExpenseTransactionDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
}

const VALID_PAYMENT_METHOD_TYPES = ['debit', 'credit', 'pix'];

export async function updateExpenseTransaction(
  deps: UpdateExpenseTransactionDeps,
  params: UpdateExpenseTransactionParams,
): Promise<Result<Transaction>> {
  if (params.amountCents !== undefined && params.amountCents <= 0) {
    return err('INVALID_AMOUNT', 'Valor deve ser maior que zero');
  }

  if (
    params.paymentMethodType !== undefined &&
    !VALID_PAYMENT_METHOD_TYPES.includes(params.paymentMethodType)
  ) {
    return err('INVALID_PAYMENT_METHOD', `Método de pagamento inválido: ${params.paymentMethodType}`);
  }

  const existing = await deps.repository.findById(params.id, params.organizationId);
  if (!existing) {
    return err('TRANSACTION_NOT_FOUND', 'Transação não encontrada');
  }
  if (existing.type !== 'expense') {
    return err(
      'INVALID_TRANSACTION_TYPE',
      'Apenas gastos podem ser editados nesta versão',
    );
  }

  const newAmount = params.amountCents ?? existing.amountCents;
  const newMethodType =
    params.paymentMethodType !== undefined ? params.paymentMethodType : existing.paymentMethodType;
  const newMethodId =
    params.paymentMethodId !== undefined ? params.paymentMethodId : existing.paymentMethodId;

  const oldAffectsBalance =
    (existing.paymentMethodType === 'debit' || existing.paymentMethodType === 'pix') &&
    !!existing.paymentMethodId;
  const newAffectsBalance =
    (newMethodType === 'debit' || newMethodType === 'pix') && !!newMethodId;

  const balanceChanged =
    existing.amountCents !== newAmount ||
    existing.paymentMethodType !== newMethodType ||
    existing.paymentMethodId !== newMethodId;

  if (balanceChanged) {
    const balances = new Map<string, { balanceCents: number }>();

    if (newAffectsBalance && newMethodId) {
      const newAcc = await deps.bankAccountRepository.findById(
        newMethodId,
        params.organizationId,
      );
      if (!newAcc) {
        return err('DESTINATION_ACCOUNT_NOT_FOUND', 'Conta de destino não encontrada');
      }
      if (newAcc.status !== 'active') {
        return err('DESTINATION_ACCOUNT_INACTIVE', 'Conta de destino está arquivada');
      }
      balances.set(newAcc.id, { balanceCents: newAcc.balanceCents });
    }

    if (oldAffectsBalance && existing.paymentMethodId) {
      let oldLocal = balances.get(existing.paymentMethodId);
      if (!oldLocal) {
        const oldAcc = await deps.bankAccountRepository.findById(
          existing.paymentMethodId,
          params.organizationId,
        );
        if (oldAcc) {
          oldLocal = { balanceCents: oldAcc.balanceCents };
          balances.set(oldAcc.id, oldLocal);
        }
      }
      if (oldLocal) {
        oldLocal.balanceCents += existing.amountCents;
        await deps.bankAccountRepository.update(existing.paymentMethodId, params.organizationId, {
          balanceCents: oldLocal.balanceCents,
        });
      }
    }

    if (newAffectsBalance && newMethodId) {
      const newLocal = balances.get(newMethodId)!;
      newLocal.balanceCents -= newAmount;
      await deps.bankAccountRepository.update(newMethodId, params.organizationId, {
        balanceCents: newLocal.balanceCents,
      });
    }
  }

  const updates: Partial<Omit<Transaction, 'id' | 'organizationId' | 'createdBy' | 'createdAt'>> = {};
  if (params.amountCents !== undefined) updates.amountCents = params.amountCents;
  if (params.categoryId !== undefined) updates.categoryId = params.categoryId;
  if (params.subcategoryId !== undefined) updates.subcategoryId = params.subcategoryId;
  if (params.establishment !== undefined) updates.establishment = params.establishment;
  if (params.paymentMethodType !== undefined) updates.paymentMethodType = params.paymentMethodType;
  if (params.paymentMethodId !== undefined) updates.paymentMethodId = params.paymentMethodId;
  if (params.installments !== undefined) updates.installments = params.installments;
  if (params.description !== undefined) updates.description = params.description;
  if (params.transactionDate !== undefined) updates.transactionDate = params.transactionDate;

  const updated = await deps.repository.update(params.id, params.organizationId, updates);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'UPDATE',
    entityType: 'transaction',
    entityId: params.id,
    oldValue: {
      amountCents: existing.amountCents,
      categoryId: existing.categoryId,
      subcategoryId: existing.subcategoryId,
      establishment: existing.establishment,
      paymentMethodType: existing.paymentMethodType,
      paymentMethodId: existing.paymentMethodId,
      installments: existing.installments,
      description: existing.description,
      transactionDate: existing.transactionDate.toISOString(),
    },
    newValue: {
      amountCents: updated.amountCents,
      categoryId: updated.categoryId,
      subcategoryId: updated.subcategoryId,
      establishment: updated.establishment,
      paymentMethodType: updated.paymentMethodType,
      paymentMethodId: updated.paymentMethodId,
      installments: updated.installments,
      description: updated.description,
      transactionDate: updated.transactionDate.toISOString(),
    },
  });

  return ok(updated);
}
