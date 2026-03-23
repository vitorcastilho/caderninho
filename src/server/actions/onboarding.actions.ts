'use server';

import { withAuth } from '@/server/infrastructure/auth/with-auth';
import { err } from '@/shared/types/result';
import { onboardingDeps } from '@/server/factories/onboarding';
import { checkOnboardingStatus } from '@/server/domain/onboarding/use-cases/check-onboarding-status';
import { completeOnboarding } from '@/server/domain/onboarding/use-cases/complete-onboarding';

function getOrganizationId(session: { session: { activeOrganizationId?: string | null } }) {
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) return null;
  return organizationId;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkOnboardingStatusAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return checkOnboardingStatus(onboardingDeps, { organizationId });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const completeOnboardingAction = withAuth(async (session, _input: unknown) => {
  const organizationId = getOrganizationId(session);
  if (!organizationId) {
    return err('NO_ACTIVE_ORGANIZATION', 'Nenhuma organização ativa. Selecione uma organização.');
  }

  return completeOnboarding(onboardingDeps, {
    organizationId,
    userId: session.user.id,
  });
});
