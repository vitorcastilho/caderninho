import { DrizzleBankAccountRepository } from '@/server/infrastructure/database/repositories/bank-account.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const bankAccountDeps = {
  repository: new DrizzleBankAccountRepository(),
  auditLogger: logAudit,
};
