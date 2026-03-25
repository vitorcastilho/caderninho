import { vi } from 'vitest';

import { listSubcategories } from './list-subcategories';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const sampleSubcategory = {
  id: 'sub-1', name: 'Aluguel', categoryId: 'cat-1',
  status: 'active' as const, organizationId: 'org-123',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('listSubcategories', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should list subcategories', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleSubcategory]);

    const result = await listSubcategories(mockRepository, { organizationId: 'org-123', includeArchived: true });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(1);
  });

  it('should return empty list', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    const result = await listSubcategories(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });
});
