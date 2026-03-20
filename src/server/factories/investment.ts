import { DrizzleInvestmentRepository } from '@/server/infrastructure/database/repositories/investment.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const investmentDeps = {
  repository: new DrizzleInvestmentRepository(),
  auditLogger: logAudit,
};
