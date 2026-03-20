import { vi } from 'vitest';

import { reactivateClassification } from './reactivate-classification';
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

const archivedClassification = {
  id: 'class-1',
  name: 'Doações',
  displayOrder: 5,
  status: 'archived' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reactivateClassification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate classification successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedClassification);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...archivedClassification, status: 'active' });

    const result = await reactivateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when already active', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...archivedClassification, status: 'active' });

    const result = await reactivateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ALREADY_ACTIVE');
  });
});
