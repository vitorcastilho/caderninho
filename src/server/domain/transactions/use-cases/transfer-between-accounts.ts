import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

interface TransferBetweenAccountsParams {
  amountCents: number;
  sourceAccountId: string;
  destinationAccountId: string;
  description?: string | null;
  transactionDate?: Date;
  organizationId: string;
  userId: string;
}

interface TransferBetweenAccountsDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
}

export async function transferBetweenAccounts(
  deps: TransferBetweenAccountsDeps,
  params: TransferBetweenAccountsParams,
): Promise<Result<Transaction>> {
  if (params.amountCents <= 0) {
    return err('INVALID_AMOUNT', 'Valor deve ser maior que zero');
  }

  if (params.sourceAccountId === params.destinationAccountId) {
    return err('SAME_ACCOUNT', 'Conta de origem e destino devem ser diferentes');
  }

  const sourceAccount = await deps.bankAccountRepository.findById(
    params.sourceAccountId,
    params.organizationId,
  );
  if (!sourceAccount) {
    return err('SOURCE_ACCOUNT_NOT_FOUND', 'Conta de origem não encontrada');
  }
  if (sourceAccount.status !== 'active') {
    return err('SOURCE_ACCOUNT_INACTIVE', 'Conta de origem está arquivada');
  }

  const destinationAccount = await deps.bankAccountRepository.findById(
    params.destinationAccountId,
    params.organizationId,
  );
  if (!destinationAccount) {
    return err('DESTINATION_ACCOUNT_NOT_FOUND', 'Conta de destino não encontrada');
  }
  if (destinationAccount.status !== 'active') {
    return err('DESTINATION_ACCOUNT_INACTIVE', 'Conta de destino está arquivada');
  }

  const transactionDate = params.transactionDate ?? new Date();
  const id = crypto.randomUUID();

  const transaction = await deps.repository.create({
    id,
    type: 'transfer',
    amountCents: params.amountCents,
    categoryId: null,
    subcategoryId: null,
    establishment: null,
    paymentMethodType: null,
    paymentMethodId: null,
    installments: null,
    description: params.description ?? null,
    incomeSourceId: null,
    sourceAccountId: params.sourceAccountId,
    destinationAccountId: params.destinationAccountId,
    transactionDate,
    referenceMonth: null,
    organizationId: params.organizationId,
    createdBy: params.userId,
  });

  // Debita conta origem e credita conta destino (saldo negativo permitido)
  await deps.bankAccountRepository.update(
    sourceAccount.id,
    params.organizationId,
    { balanceCents: sourceAccount.balanceCents - params.amountCents },
  );
  await deps.bankAccountRepository.update(
    destinationAccount.id,
    params.organizationId,
    { balanceCents: destinationAccount.balanceCents + params.amountCents },
  );

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'CREATE',
    entityType: 'transaction',
    entityId: transaction.id,
    oldValue: null,
    newValue: {
      type: 'transfer',
      amountCents: params.amountCents,
      sourceAccountId: params.sourceAccountId,
      destinationAccountId: params.destinationAccountId,
    },
  });

  return ok(transaction);
}
