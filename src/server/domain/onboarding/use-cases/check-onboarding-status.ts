import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';
import type { OnboardingRepository } from '../repositories/onboarding.repository';

interface CheckOnboardingStatusParams {
  organizationId: string;
}

export async function checkOnboardingStatus(
  deps: { repository: OnboardingRepository },
  params: CheckOnboardingStatusParams,
): Promise<Result<{ completed: boolean }>> {
  const completed = await deps.repository.getOnboardingStatus(params.organizationId);

  if (completed === undefined || completed === null) {
    return err('ORGANIZATION_NOT_FOUND', 'Organização não encontrada.');
  }

  return ok({ completed });
}
