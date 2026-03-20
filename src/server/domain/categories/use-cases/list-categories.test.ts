import { vi } from 'vitest';

import { listCategories } from './list-categories';
import type { CategoryRepository } from '../repositories/category.repository';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const sampleCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('listCategories', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should list categories', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleCategory]);

    const result = await listCategories(mockRepository, { organizationId: 'org-123', includeArchived: true });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(1);
  });

  it('should return empty list', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    const result = await listCategories(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });
});
