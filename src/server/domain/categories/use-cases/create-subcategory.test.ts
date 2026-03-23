import { vi } from 'vitest';

import { createSubcategory } from './create-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { CategoryRepository } from '../repositories/category.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockCategoryRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const activeCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

const sampleSubcategory = {
  id: expect.any(String), name: 'Aluguel', categoryId: 'cat-1',
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('createSubcategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(activeCategory);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleSubcategory);
  });

  it('should create subcategory successfully', async () => {
    const result = await createSubcategory(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { name: 'Aluguel', categoryId: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Aluguel');
  });

  it('should return error when category not found', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

    const result = await createSubcategory(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { name: 'Aluguel', categoryId: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when category is archived', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue({ ...activeCategory, status: 'archived' });

    const result = await createSubcategory(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { name: 'Aluguel', categoryId: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_ARCHIVED');
  });

  it('should register audit log', async () => {
    await createSubcategory(
      { repository: mockRepository, categoryRepository: mockCategoryRepository, auditLogger: mockAuditLogger },
      { name: 'Aluguel', categoryId: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'subcategory' }));
  });
});
