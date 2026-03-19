import { DrizzleCreditCardRepository } from '@/server/infrastructure/database/repositories/credit-card.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const creditCardDeps = {
  repository: new DrizzleCreditCardRepository(),
  auditLogger: logAudit,
};
