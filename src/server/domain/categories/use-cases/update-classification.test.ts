import { vi } from 'vitest';

import { updateClassification } from './update-classification';
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
  id: 'class-1',
  name: 'Essenciais',
  displayOrder: 1,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('updateClassification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update classification and return ok result', async () => {
    const updated = { ...sampleClassification, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleClassification);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Novo Nome');
    }
  });

  it('should return error when classification not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
    }
  });

  it('should register audit log', async () => {
    const updated = { ...sampleClassification, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleClassification);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UPDATE', entityType: 'essentiality_classification' }),
    );
  });
});
