import { vi } from 'vitest';

import { listBankAccounts } from './list-bank-accounts';
import type { BankAccountRepository } from '../repositories/bank-account.repository';

const mockRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const sampleAccounts = [
  {
    id: '1',
    name: 'Conta Corrente',
    bank: 'Nubank',
    balanceCents: 14999,
    status: 'active' as const,
    organizationId: 'org-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Poupança',
    bank: 'Itaú',
    balanceCents: 50000,
    status: 'active' as const,
    organizationId: 'org-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('listBankAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return list of accounts', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue(sampleAccounts);

    const result = await listBankAccounts(mockRepository, {
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it('should pass includeArchived to repository', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue(sampleAccounts);

    await listBankAccounts(mockRepository, {
      organizationId: 'org-123',
      includeArchived: true,
    });

    expect(mockRepository.findAllByOrganization).toHaveBeenCalledWith('org-123', true);
  });
});
