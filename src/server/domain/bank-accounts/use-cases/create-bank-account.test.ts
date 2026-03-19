import { vi } from 'vitest';

import { createBankAccount } from './create-bank-account';
import type { BankAccountRepository } from '../repositories/bank-account.repository';

vi.mock('@/server/infrastructure/audit/audit.service', () => ({
  logAudit: vi.fn(),
}));

import { logAudit } from '@/server/infrastructure/audit/audit.service';

const mockRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const sampleAccount = {
  id: expect.any(String),
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleAccount);
  });

  it('should create account and return ok result', async () => {
    const result = await createBankAccount(mockRepository, {
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 14999,
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Conta Corrente');
    }
    expect(mockRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 14999,
      organizationId: 'org-123',
    });
  });

  it('should register audit log on create', async () => {
    await createBankAccount(mockRepository, {
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 14999,
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(logAudit).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'bank_account',
      entityId: expect.any(String),
      oldValue: null,
      newValue: { name: 'Conta Corrente', bank: 'Nubank', balanceCents: 14999 },
    });
  });
});
