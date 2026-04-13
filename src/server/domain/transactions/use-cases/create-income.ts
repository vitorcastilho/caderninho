import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { IncomeSourceRepository } from '@/server/domain/income-sources/repositories/income-source.repository';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

interface CreateIncomeParams {
  amountCents: number;
  incomeSourceId: string;
  destinationAccountId: string;
  description?: string | null;
  transactionDate?: Date;
  organizationId: string;
  userId: string;
}

interface CreateIncomeDeps {
  repository: TransactionRepository;
  auditLogger: AuditLogger;
  bankAccountRepository: BankAccountRepository;
  incomeSourceRepository: IncomeSourceRepository;
}

export async function createIncome(
  deps: CreateIncomeDeps,
  params: CreateIncomeParams,
): Promise<Result<Transaction>> {
  if (params.amountCents <= 0) {
    return err('INVALID_AMOUNT', 'Valor deve ser maior que zero');
  }

  const incomeSource = await deps.incomeSourceRepository.findById(
    params.incomeSourceId,
    params.organizationId,
  );
  if (!incomeSource) {
    return err('INCOME_SOURCE_NOT_FOUND', 'Fonte de receita não encontrada');
  }
  if (incomeSource.status !== 'active') {
    return err('INCOME_SOURCE_INACTIVE', 'Fonte de receita está arquivada');
  }

  const destinationAccount = await deps.bankAccountRepository.findById(
    params.destinationAccountId,
    params.organizationId,
  );
  if (!destinationAccount) {
    return err('DESTINATION_ACCOUNT_NOT_FOUND', 'Conta de destino não encontrada');
  }

  const transactionDate = params.transactionDate ?? new Date();
  const id = crypto.randomUUID();

  const transaction = await deps.repository.create({
    id,
    type: 'income',
    amountCents: params.amountCents,
    categoryId: null,
    subcategoryId: null,
    establishment: null,
    paymentMethodType: null,
    paymentMethodId: null,
    installments: null,
    description: params.description ?? null,
    incomeSourceId: params.incomeSourceId,
    sourceAccountId: null,
    destinationAccountId: params.destinationAccountId,
    transactionDate,
    referenceMonth: null,
    organizationId: params.organizationId,
    createdBy: params.userId,
  });

  // Creditar saldo da conta de destino
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
      type: 'income',
      amountCents: params.amountCents,
      incomeSourceId: params.incomeSourceId,
      destinationAccountId: params.destinationAccountId,
    },
  });

  return ok(transaction);
}
