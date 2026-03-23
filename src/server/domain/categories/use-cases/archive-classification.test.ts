import { vi } from 'vitest';

import { archiveClassification } from './archive-classification';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: ClassificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockCategoryRepository: CategoryRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(),
  countActiveByClassification: vi.fn(),
  update: vi.fn(),
  updateClassificationBulk: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleClassification = {
  id: 'class-1',
  name: 'Doações',
  displayOrder: 5,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('archiveClassification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive classification successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleClassification);
    vi.mocked(mockCategoryRepository.countActiveByClassification).mockResolvedValue(0);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...sampleClassification, status: 'archived' });

    const result = await archiveClassification(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveClassification(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when already archived', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...sampleClassification, status: 'archived' });

    const result = await archiveClassification(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ALREADY_ARCHIVED');
  });

  it('should return error when has active categories', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleClassification);
    vi.mocked(mockCategoryRepository.countActiveByClassification).mockResolvedValue(3);

    const result = await archiveClassification(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { id: 'class-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_HAS_ACTIVE_CATEGORIES');
  });
});
