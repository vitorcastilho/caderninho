import { vi } from 'vitest';

import { getInvestment } from './get-investment';
import type { InvestmentRepository } from '../repositories/investment.repository';

const mockRepository: InvestmentRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const sampleInvestment = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'CDB Banco X',
  institution: 'Banco X',
  type: 'renda_fixa' as const,
  balanceCents: 1000000,
  yieldRateBasisPoints: 11000,
  lastBalanceUpdate: new Date(),
  maturityDate: '2027-12-31',
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getInvestment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return investment when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);

    const result = await getInvestment(mockRepository, {
      id: sampleInvestment.id,
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('CDB Banco X');
    }
  });

  it('should return error when investment not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getInvestment(mockRepository, {
      id: 'nonexistent',
      organizationId: 'org-123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_NOT_FOUND');
    }
  });
});
