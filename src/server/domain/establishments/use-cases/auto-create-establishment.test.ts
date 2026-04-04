import { vi } from 'vitest';

import { autoCreateEstablishment } from './auto-create-establishment';
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

const existingEstablishment = {
  id: 'est-1', name: 'Pão de Açúcar', emoji: '📍',
  subcategoryId: 'sub-1', source: 'auto' as const,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  budgetMinCents: null, budgetMaxCents: null,
  visitCount: 3, lastVisitAt: new Date('2026-03-20'),
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('autoCreateEstablishment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should create new establishment when not found', async () => {
    const newEstablishment = {
      id: expect.any(String), name: 'Pão de Açúcar', emoji: '📍',
      subcategoryId: 'sub-1', source: 'auto' as const,
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      budgetMinCents: null, budgetMaxCents: null,
      visitCount: 0, lastVisitAt: null,
      status: 'active' as const, organizationId: 'org-123',
      createdAt: new Date(), updatedAt: new Date(),
    };
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(null);
    vi.mocked(mockRepository.create).mockResolvedValue(newEstablishment);

    const result = await autoCreateEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1', organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('auto');
    }
    expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      source: 'auto',
      emoji: '📍',
    }));
  });

  it('should increment visit count when establishment already exists', async () => {
    const incremented = { ...existingEstablishment, visitCount: 4, lastVisitAt: new Date() };
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(existingEstablishment);
    vi.mocked(mockRepository.incrementVisitCount).mockResolvedValue(incremented);

    const result = await autoCreateEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1', organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.visitCount).toBe(4);
    }
    expect(mockRepository.incrementVisitCount).toHaveBeenCalledWith('est-1', 'org-123');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
