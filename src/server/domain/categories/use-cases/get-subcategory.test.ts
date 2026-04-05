import { vi } from 'vitest';

import { getSubcategory } from './get-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const sampleSubcategory = {
  id: 'sub-1', name: 'Aluguel', emoji: '📋', categoryId: 'cat-1',
  status: 'active' as const, organizationId: 'org-123',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('getSubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return subcategory when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);

    const result = await getSubcategory(mockRepository, { id: 'sub-1', organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Aluguel');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getSubcategory(mockRepository, { id: 'sub-1', organizationId: 'org-123' });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });
});
