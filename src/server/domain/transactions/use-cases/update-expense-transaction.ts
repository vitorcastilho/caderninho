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

export interface UpdateExpenseTransactionDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
  withTransaction: <T>(
    fn: (scoped: {
      repository: TransactionRepository;
      bankAccountRepository: BankAccountRepository;
    }) => Promise<T>,
  ) => Promise<T>;
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

  // Pré-validação da nova conta (fora da transação — só leitura)
  if (balanceChanged && newAffectsBalance && newMethodId) {
    const newAcc = await deps.bankAccountRepository.findById(newMethodId, params.organizationId);
    if (!newAcc) {
      return err('DESTINATION_ACCOUNT_NOT_FOUND', 'Conta de destino não encontrada');
    }
    if (newAcc.status !== 'active') {
      return err('DESTINATION_ACCOUNT_INACTIVE', 'Conta de destino está arquivada');
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

  const updated = await deps.withTransaction(async (tx) => {
    if (balanceChanged) {
      // Map<accountId, finalBalance> — computa saldos finais na memória e escreve
      // uma única vez por conta (evita gravação intermediária quando old === new).
      const balances = new Map<string, number>();

      // Carrega nova conta (já validada fora da tx, mas lemos dentro da tx pra
      // usar o estado atual mesmo se houve escrita concorrente).
      if (newAffectsBalance && newMethodId) {
        const newAcc = await tx.bankAccountRepository.findById(newMethodId, params.organizationId);
        if (newAcc) {
          balances.set(newAcc.id, newAcc.balanceCents);
        }
      }

      // Carrega conta antiga se for diferente
      if (oldAffectsBalance && existing.paymentMethodId) {
        if (!balances.has(existing.paymentMethodId)) {
          const oldAcc = await tx.bankAccountRepository.findById(
            existing.paymentMethodId,
            params.organizationId,
          );
          if (oldAcc) {
            balances.set(oldAcc.id, oldAcc.balanceCents);
          }
        }
      }

      // Aplica reversão do saldo antigo
      if (oldAffectsBalance && existing.paymentMethodId) {
        const current = balances.get(existing.paymentMethodId);
        if (current !== undefined) {
          balances.set(existing.paymentMethodId, current + existing.amountCents);
        }
      }

      // Aplica débito do saldo novo
      if (newAffectsBalance && newMethodId) {
        const current = balances.get(newMethodId);
        if (current !== undefined) {
          balances.set(newMethodId, current - newAmount);
        }
      }

      // Única gravação por conta (MED 2)
      for (const [accountId, finalBalance] of balances) {
        await tx.bankAccountRepository.update(accountId, params.organizationId, {
          balanceCents: finalBalance,
        });
      }
    }

    return tx.repository.update(params.id, params.organizationId, updates);
  });

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
