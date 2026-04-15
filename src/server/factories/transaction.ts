import { db, type DbExecutor } from '@/server/infrastructure/database/client';
import { DrizzleTransactionRepository } from '@/server/infrastructure/database/repositories/transaction.repository.impl';
import { DrizzleBankAccountRepository } from '@/server/infrastructure/database/repositories/bank-account.repository.impl';
import { DrizzleIncomeSourceRepository } from '@/server/infrastructure/database/repositories/income-source.repository.impl';
import { DrizzleCategoryRepository } from '@/server/infrastructure/database/repositories/category.repository.impl';
import { DrizzleSubcategoryRepository } from '@/server/infrastructure/database/repositories/subcategory.repository.impl';
import { DrizzleCreditCardRepository } from '@/server/infrastructure/database/repositories/credit-card.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';
import type { TransactionRepository } from '@/server/domain/transactions/repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';

export interface ScopedTransactionRepos {
  repository: TransactionRepository;
  bankAccountRepository: BankAccountRepository;
}

async function withTransaction<T>(
  fn: (scoped: ScopedTransactionRepos) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    const executor = tx as unknown as DbExecutor;
    return fn({
      repository: new DrizzleTransactionRepository(executor),
      bankAccountRepository: new DrizzleBankAccountRepository(executor),
    });
  });
}

export const transactionDeps = {
  repository: new DrizzleTransactionRepository(),
  auditLogger: logAudit,
  bankAccountRepository: new DrizzleBankAccountRepository(),
  incomeSourceRepository: new DrizzleIncomeSourceRepository(),
  categoryRepository: new DrizzleCategoryRepository(),
  subcategoryRepository: new DrizzleSubcategoryRepository(),
  creditCardRepository: new DrizzleCreditCardRepository(),
  withTransaction,
};
