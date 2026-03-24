import { vi } from 'vitest';

import { checkOnboardingStatus } from './check-onboarding-status';
import type { OnboardingRepository } from '../repositories/onboarding.repository';

const mockRepository: OnboardingRepository = {
  getOnboardingStatus: vi.fn(),
  completeOnboarding: vi.fn(),
};

describe('checkOnboardingStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return completed: false when onboarding not done', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(false);

    const result = await checkOnboardingStatus(
      { repository: mockRepository },
      { organizationId: 'org-123' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
    }
    expect(mockRepository.getOnboardingStatus).toHaveBeenCalledWith('org-123');
  });

  it('should return completed: true when onboarding already done', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(true);

    const result = await checkOnboardingStatus(
      { repository: mockRepository },
      { organizationId: 'org-123' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
  });

  it('should return ORGANIZATION_NOT_FOUND when org does not exist', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(null);

    const result = await checkOnboardingStatus(
      { repository: mockRepository },
      { organizationId: 'non-existent-org' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ORGANIZATION_NOT_FOUND');
    }
  });
});
