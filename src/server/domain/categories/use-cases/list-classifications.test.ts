import { vi } from 'vitest';

import { listClassifications } from './list-classifications';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { CategoryRepository } from '../repositories/category.repository';

const mockClassificationRepository: ClassificationRepository = {
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

const sampleClassification = {
  id: 'class-1',
  name: 'Essenciais',
  displayOrder: 1,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('listClassifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list classifications with category counts', async () => {
    vi.mocked(mockClassificationRepository.findAllByOrganization).mockResolvedValue([sampleClassification]);
    vi.mocked(mockCategoryRepository.countActiveByClassification).mockResolvedValue(3);

    const result = await listClassifications(
      { classificationRepository: mockClassificationRepository, categoryRepository: mockCategoryRepository },
      { organizationId: 'org-123', includeArchived: true },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].activeCategoryCount).toBe(3);
    }
  });

  it('should return empty list when no classifications', async () => {
    vi.mocked(mockClassificationRepository.findAllByOrganization).mockResolvedValue([]);

    const result = await listClassifications(
      { classificationRepository: mockClassificationRepository, categoryRepository: mockCategoryRepository },
      { organizationId: 'org-123' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});
