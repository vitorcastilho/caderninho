import { vi } from 'vitest';

import { archiveCategory } from './archive-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockSubcategoryRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('archiveCategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should archive category successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockSubcategoryRepository.countActiveByCategory).mockResolvedValue(0);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...sampleCategory, status: 'archived' });

    const result = await archiveCategory(
      { repository: mockRepository, subcategoryRepository: mockSubcategoryRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveCategory(
      { repository: mockRepository, subcategoryRepository: mockSubcategoryRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when already archived', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...sampleCategory, status: 'archived' });

    const result = await archiveCategory(
      { repository: mockRepository, subcategoryRepository: mockSubcategoryRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_ALREADY_ARCHIVED');
  });

  it('should return error when has active subcategories', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockSubcategoryRepository.countActiveByCategory).mockResolvedValue(2);

    const result = await archiveCategory(
      { repository: mockRepository, subcategoryRepository: mockSubcategoryRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_HAS_ACTIVE_SUBCATEGORIES');
  });
});
