import { vi } from 'vitest';

import { getIncomeSource } from './get-income-source';
import type { IncomeSourceRepository } from '../repositories/income-source.repository';

const mockRepository: IncomeSourceRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const sampleIncomeSource = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Salário ACME',
  employmentType: 'clt' as const,
  isRecurring: true,
  baseAmountCents: 800000,
  usualPaymentDay: 25,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getIncomeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return income source when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleIncomeSource);

    const result = await getIncomeSource(mockRepository, {
      id: sampleIncomeSource.id,
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Salário ACME');
    }
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getIncomeSource(mockRepository, {
      id: 'nonexistent',
      organizationId: 'org-123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_NOT_FOUND');
    }
  });
});
