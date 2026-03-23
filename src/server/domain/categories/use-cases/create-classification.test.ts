import { vi } from 'vitest';

import { createClassification } from './create-classification';
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
  id: expect.any(String),
  name: 'Personalizada',
  displayOrder: 8,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createClassification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleClassification);
  });

  it('should create classification and return ok result', async () => {
    const result = await createClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { name: 'Personalizada', displayOrder: 8, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Personalizada');
    }
    expect(mockRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'Personalizada',
      displayOrder: 8,
      organizationId: 'org-123',
    });
  });

  it('should register audit log', async () => {
    await createClassification(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { name: 'Personalizada', displayOrder: 8, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entityType: 'essentiality_classification' }),
    );
  });
});
