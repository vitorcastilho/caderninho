import { vi } from 'vitest';

import { updateBankAccount } from './update-bank-account';
import type { BankAccountRepository } from '../repositories/bank-account.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const existingAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('updateBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update account and return ok result', async () => {
    const updated = { ...existingAccount, name: 'Nova Conta' };
    vi.mocked(mockRepository.findById).mockResolvedValue(existingAccount);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: existingAccount.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Nova Conta' },
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Nova Conta');
    }
  });

  it('should return error when account not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: 'nonexistent',
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Nova Conta' },
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_NOT_FOUND');
    }
  });

  it('should register audit with oldValue and newValue', async () => {
    const updated = { ...existingAccount, name: 'Nova Conta' };
    vi.mocked(mockRepository.findById).mockResolvedValue(existingAccount);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: existingAccount.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Nova Conta' },
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'UPDATE',
      entityType: 'bank_account',
      entityId: existingAccount.id,
      oldValue: { name: 'Conta Corrente', bank: 'Nubank', balanceCents: 14999 },
      newValue: { name: 'Nova Conta', bank: 'Nubank', balanceCents: 14999 },
    });
  });
});
