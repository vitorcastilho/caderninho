import { vi } from 'vitest';

import { getSuggestedEstablishments } from './get-suggested-establishments';
import type { TransactionRepository } from '../repositories/transaction.repository';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findByOrganizationFiltered: vi.fn(),
  aggregateByTypeForOrganizationFiltered: vi.fn(),
  findTopEstablishments: vi.fn(),
  sumMonthlySpentByCategory: vi.fn(),
  getMonthlySpendingSummary: vi.fn(),
};

describe('getSuggestedEstablishments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar top 5 estabelecimentos dos ultimos 90 dias', async () => {
    vi.mocked(mockRepository.findTopEstablishments).mockResolvedValue([
      'Pão de Açúcar',
      'Bistek',
      'Angeloni',
    ]);

    const result = await getSuggestedEstablishments(mockRepository, {
      subcategoryId: 'sub-123',
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(['Pão de Açúcar', 'Bistek', 'Angeloni']);
    }
    expect(mockRepository.findTopEstablishments).toHaveBeenCalledWith(
      'sub-123',
      'org-123',
      5,
      90,
    );
  });

  it('deve retornar lista vazia quando nao ha estabelecimentos', async () => {
    vi.mocked(mockRepository.findTopEstablishments).mockResolvedValue([]);

    const result = await getSuggestedEstablishments(mockRepository, {
      subcategoryId: 'sub-new',
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([]);
    }
  });
});
