import { vi } from 'vitest';

import { seedDefaultClassifications } from './seed-default-classifications';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: ClassificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleClassification = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Essenciais',
  displayOrder: 1,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('seedDefaultClassifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create 7 default classifications when none exist', async () => {
    vi.mocked(mockRepository.countByOrganization).mockResolvedValue(0);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleClassification);

    const result = await seedDefaultClassifications(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(7);
    }
    expect(mockRepository.create).toHaveBeenCalledTimes(7);
  });

  it('should return existing classifications when already seeded', async () => {
    vi.mocked(mockRepository.countByOrganization).mockResolvedValue(7);
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleClassification]);

    const result = await seedDefaultClassifications(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockRepository.findAllByOrganization).toHaveBeenCalledWith('org-123', true);
  });

  it('should log audit when seeding', async () => {
    vi.mocked(mockRepository.countByOrganization).mockResolvedValue(0);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleClassification);

    await seedDefaultClassifications(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'SEED',
      entityType: 'essentiality_classification',
      entityId: 'batch',
      oldValue: null,
      newValue: expect.objectContaining({ count: 7 }),
    });
  });
});
