import { eq } from 'drizzle-orm';

import { db } from '@/server/infrastructure/database/client';
import { organizations } from '@/server/infrastructure/database/schema';
import type { OnboardingRepository } from '@/server/domain/onboarding/repositories/onboarding.repository';

export class DrizzleOnboardingRepository implements OnboardingRepository {
  async getOnboardingStatus(organizationId: string): Promise<boolean | null> {
    const results = await db
      .select({ hasCompletedOnboarding: organizations.hasCompletedOnboarding })
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (results.length === 0) {
      return null;
    }

    return results[0].hasCompletedOnboarding;
  }

  async completeOnboarding(organizationId: string): Promise<void> {
    await db
      .update(organizations)
      .set({ hasCompletedOnboarding: true })
      .where(eq(organizations.id, organizationId))
      .returning();
  }
}
