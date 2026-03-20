import { vi } from 'vitest';

import { listInvestments } from './list-investments';
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

describe('listInvestments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of investments', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleInvestment]);

    const result = await listInvestments(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('CDB Banco X');
    }
  });

  it('should pass includeArchived to repository', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    await listInvestments(mockRepository, {
      organizationId: 'org-123',
      includeArchived: true,
    });

    expect(mockRepository.findAllByOrganization).toHaveBeenCalledWith('org-123', true);
  });

  it('should return empty list when no investments', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    const result = await listInvestments(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });
});
