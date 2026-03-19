import { vi } from 'vitest';

import { getBankAccount } from './get-bank-account';
import type { BankAccountRepository } from '../repositories/bank-account.repository';

const mockRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const sampleAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('getBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return account when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleAccount);

    const result = await getBankAccount(mockRepository, {
      id: sampleAccount.id,
      organizationId: 'org-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(sampleAccount.id);
    }
  });

  it('should return error when account not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getBankAccount(mockRepository, {
      id: 'nonexistent',
      organizationId: 'org-123',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_NOT_FOUND');
    }
  });
});
