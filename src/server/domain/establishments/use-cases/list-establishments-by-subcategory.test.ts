import { vi } from 'vitest';

import { listEstablishmentsBySubcategory } from './list-establishments-by-subcategory';
import type { EstablishmentRepository } from '../repositories/establishment.repository';

const mockRepository: EstablishmentRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findBySubcategory: vi.fn(),
  findByNameAndSubcategory: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  incrementVisitCount: vi.fn(),
};

const deps = { repository: mockRepository };

const sampleEstablishments = [
  {
    id: 'est-1', name: 'Pão de Açúcar', emoji: '🛒',
    subcategoryId: 'sub-1', source: 'manual' as const,
    visitCount: 5, lastVisitAt: new Date(),
    status: 'active' as const, organizationId: 'org-123',
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: 'est-2', name: 'Carrefour', emoji: '📍',
    subcategoryId: 'sub-1', source: 'auto' as const,
    visitCount: 2, lastVisitAt: new Date(),
    status: 'active' as const, organizationId: 'org-123',
    createdAt: new Date(), updatedAt: new Date(),
  },
];

describe('listEstablishmentsBySubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return establishments for a subcategory', async () => {
    vi.mocked(mockRepository.findBySubcategory).mockResolvedValue(sampleEstablishments);

    const result = await listEstablishmentsBySubcategory(deps, {
      subcategoryId: 'sub-1', organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(2);
  });

  it('should return empty array when no establishments', async () => {
    vi.mocked(mockRepository.findBySubcategory).mockResolvedValue([]);

    const result = await listEstablishmentsBySubcategory(deps, {
      subcategoryId: 'sub-1', organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });
});
