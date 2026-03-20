import { DrizzleIncomeSourceRepository } from '@/server/infrastructure/database/repositories/income-source.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const incomeSourceDeps = {
  repository: new DrizzleIncomeSourceRepository(),
  auditLogger: logAudit,
};
