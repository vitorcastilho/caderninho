import { vi } from 'vitest';

import { getCategory } from './get-category';
import type { CategoryRepository } from '../repositories/category.repository';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const sampleCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('getCategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return category when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);

    const result = await getCategory(mockRepository, { id: 'cat-1', organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Moradia');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getCategory(mockRepository, { id: 'cat-1', organizationId: 'org-123' });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });
});
