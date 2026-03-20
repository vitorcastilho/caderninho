import { vi } from 'vitest';

import { listIncomeSources } from './list-income-sources';
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

describe('listIncomeSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of income sources', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleIncomeSource]);

    const result = await listIncomeSources(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
    }
  });

  it('should pass includeArchived to repository', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    await listIncomeSources(mockRepository, { organizationId: 'org-123', includeArchived: true });

    expect(mockRepository.findAllByOrganization).toHaveBeenCalledWith('org-123', true);
  });
});
