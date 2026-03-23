import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';
import type { OnboardingRepository } from '../repositories/onboarding.repository';

interface CompleteOnboardingParams {
  organizationId: string;
  userId: string;
}

export async function completeOnboarding(
  deps: { repository: OnboardingRepository; auditLogger: AuditLogger },
  params: CompleteOnboardingParams,
): Promise<Result<{ completed: boolean }>> {
  const alreadyCompleted = await deps.repository.getOnboardingStatus(params.organizationId);

  if (alreadyCompleted === undefined || alreadyCompleted === null) {
    return err('ORGANIZATION_NOT_FOUND', 'Organização não encontrada.');
  }

  if (alreadyCompleted) {
    return err('ONBOARDING_ALREADY_COMPLETED', 'Onboarding já foi concluído.');
  }

  await deps.repository.completeOnboarding(params.organizationId);

  await deps.auditLogger({
    userId: params.userId,
    organizationId: params.organizationId,
    action: 'COMPLETE',
    entityType: 'onboarding',
    entityId: params.organizationId,
    oldValue: { hasCompletedOnboarding: false },
    newValue: { hasCompletedOnboarding: true },
  });

  return ok({ completed: true });
}
