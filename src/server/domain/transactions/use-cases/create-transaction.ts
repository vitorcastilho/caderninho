import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';

interface CreateTransactionParams {
  amountCents: number;
  categoryId: string;
  subcategoryId?: string | null;
  establishment?: string | null;
  paymentMethodType: string;
  paymentMethodId?: string | null;
  description?: string | null;
  transactionDate?: Date;
  organizationId: string;
  userId: string;
}

interface CreateTransactionDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
}

export async function createTransaction(
  deps: CreateTransactionDeps,
  params: CreateTransactionParams,
): Promise<Result<Transaction>> {
  if (params.amountCents <= 0) {
    return err('INVALID_AMOUNT', 'Valor deve ser maior que zero');
  }

  const transactionDate = params.transactionDate ?? new Date();
  const id = crypto.randomUUID();

  const transaction = await deps.repository.create({
    id,
    type: 'expense',
    amountCents: params.amountCents,
    categoryId: params.categoryId,
    subcategoryId: params.subcategoryId ?? null,
    establishment: params.establishment ?? null,
    paymentMethodType: params.paymentMethodType,
    paymentMethodId: params.paymentMethodId ?? null,
    description: params.description ?? null,
    transactionDate,
    referenceMonth: null,
    organizationId: params.organizationId,
    createdBy: params.userId,
  });

  // Debitar saldo da conta para pagamentos debit/pix
  if (
    (params.paymentMethodType === 'debit' || params.paymentMethodType === 'pix') &&
    params.paymentMethodId
  ) {
    const account = await deps.bankAccountRepository.findById(
      params.paymentMethodId,
      params.organizationId,
    );
    if (account) {
      const newBalance = account.balanceCents - params.amountCents;
      await deps.bankAccountRepository.update(
        account.id,
        params.organizationId,
        { balanceCents: newBalance },
      );
    }
  }
  // Transacao de credito NAO altera saldo de conta (Epic 5 detalha metricas)

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'transaction',
    entityId: transaction.id,
    oldValue: null,
    newValue: {
      type: 'expense',
      amountCents: params.amountCents,
      categoryId: params.categoryId,
      paymentMethodType: params.paymentMethodType,
    },
  });

  return ok(transaction);
}
