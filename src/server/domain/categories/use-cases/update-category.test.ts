import { vi } from 'vitest';

import { updateCategory } from './update-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockClassificationRepository: ClassificationRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(), update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('updateCategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should update category successfully', async () => {
    const updated = { ...sampleCategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Novo Nome');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when reclassifying to non-existent classification', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(null);

    const result = await updateCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { classificationId: 'new-class' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when reclassifying to archived classification', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue({
      id: 'new-class', name: 'Archived', displayOrder: 1, status: 'archived' as const,
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateCategory(
      { repository: mockRepository, classificationRepository: mockClassificationRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { classificationId: 'new-class' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ARCHIVED');
  });
});
