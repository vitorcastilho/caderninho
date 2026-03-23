import { DrizzleOnboardingRepository } from '@/server/infrastructure/database/repositories/onboarding.repository.impl';
import { logAudit } from '@/server/infrastructure/audit/audit.service';

export const onboardingDeps = {
  repository: new DrizzleOnboardingRepository(),
  auditLogger: logAudit,
};
