import { vi } from 'vitest';

import { reactivateBankAccount } from './reactivate-bank-account';
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

const archivedAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'archived' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reactivateBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate account and return ok result', async () => {
    const reactivated = { ...archivedAccount, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedAccount);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    const result = await reactivateBankAccount(mockRepository, {
      id: archivedAccount.id,
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should return error when account not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateBankAccount(mockRepository, {
      id: 'nonexistent',
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_NOT_FOUND');
    }
  });

  it('should return error when account already active', async () => {
    const activeAccount = { ...archivedAccount, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(activeAccount);

    const result = await reactivateBankAccount(mockRepository, {
      id: activeAccount.id,
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_ALREADY_ACTIVE');
    }
  });

  it('should register audit on reactivation', async () => {
    const reactivated = { ...archivedAccount, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedAccount);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    await reactivateBankAccount(mockRepository, {
      id: archivedAccount.id,
      organizationId: 'org-123',
      userId: 'user-1',
    });

    expect(logAudit).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'REACTIVATE',
      entityType: 'bank_account',
      entityId: archivedAccount.id,
      oldValue: { status: 'archived' },
      newValue: { status: 'active' },
    });
  });
});
