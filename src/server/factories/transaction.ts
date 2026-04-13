import { DrizzleTransactionRepository } from '@/server/infrastructure/database/repositories/transaction.repository.impl';
import { DrizzleBankAccountRepository } from '@/server/infrastructure/database/repositories/bank-account.repository.impl';
import { DrizzleIncomeSourceRepository } from '@/server/infrastructure/database/repositories/income-source.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const transactionDeps = {
  repository: new DrizzleTransactionRepository(),
  auditLogger: logAudit,
  bankAccountRepository: new DrizzleBankAccountRepository(),
  incomeSourceRepository: new DrizzleIncomeSourceRepository(),
};
