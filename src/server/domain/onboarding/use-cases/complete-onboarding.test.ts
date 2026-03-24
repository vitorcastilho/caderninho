import { vi } from 'vitest';

import { completeOnboarding } from './complete-onboarding';
import type { OnboardingRepository } from '../repositories/onboarding.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: OnboardingRepository = {
  getOnboardingStatus: vi.fn(),
  completeOnboarding: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete onboarding and return ok result', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(false);

    const result = await completeOnboarding(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
    expect(mockRepository.completeOnboarding).toHaveBeenCalledWith('org-123');
  });

  it('should register audit log on complete', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(false);

    await completeOnboarding(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'COMPLETE',
      entityType: 'onboarding',
      entityId: 'org-123',
      oldValue: { hasCompletedOnboarding: false },
      newValue: { hasCompletedOnboarding: true },
    });
  });

  it('should return error when onboarding already completed', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(true);

    const result = await completeOnboarding(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ONBOARDING_ALREADY_COMPLETED');
    }
    expect(mockRepository.completeOnboarding).not.toHaveBeenCalled();
  });

  it('should return ORGANIZATION_NOT_FOUND when org does not exist', async () => {
    vi.mocked(mockRepository.getOnboardingStatus).mockResolvedValue(null);

    const result = await completeOnboarding(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'non-existent-org', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('ORGANIZATION_NOT_FOUND');
    }
    expect(mockRepository.completeOnboarding).not.toHaveBeenCalled();
    expect(mockAuditLogger).not.toHaveBeenCalled();
  });
});
