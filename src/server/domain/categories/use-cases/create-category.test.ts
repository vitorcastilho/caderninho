import { vi } from 'vitest';

import { createCategory } from './create-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(),
  countActiveByClassification: vi.fn(),
  update: vi.fn(),
  updateClassificationBulk: vi.fn(),
  updateStatus: vi.fn(),
};

const mockClassificationRepository: ClassificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const activeClassification = {
  id: 'class-1', name: 'Essenciais', displayOrder: 1, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

const sampleCategory = {
  id: expect.any(String), name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('createCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(activeClassification);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleCategory);
  });

  it('should create category successfully', async () => {
    const result = await createCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { name: 'Moradia', classificationId: 'class-1', budgetMinCents: 220000, budgetMaxCents: null, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Moradia');
  });

  it('should return error when classification not found', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(null);

    const result = await createCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when classification is archived', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue({ ...activeClassification, status: 'archived' });

    const result = await createCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ARCHIVED');
  });

  it('should register audit log', async () => {
    await createCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { name: 'Moradia', classificationId: 'class-1', budgetMinCents: 220000, budgetMaxCents: null, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'category' }));
  });
});
