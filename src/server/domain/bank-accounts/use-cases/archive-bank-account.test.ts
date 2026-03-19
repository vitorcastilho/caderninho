import { vi } from 'vitest';

import { archiveBankAccount } from './archive-bank-account';
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

const activeAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('archiveBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive account and return ok result', async () => {
    const archived = { ...activeAccount, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(activeAccount);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    const result = await archiveBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: activeAccount.id,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('archived');
    }
  });

  it('should return error when account not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: 'nonexistent',
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_NOT_FOUND');
    }
  });

  it('should return error when account already archived', async () => {
    const archivedAccount = { ...activeAccount, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedAccount);

    const result = await archiveBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: archivedAccount.id,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('BANK_ACCOUNT_ALREADY_ARCHIVED');
    }
  });

  it('should register audit on archive', async () => {
    const archived = { ...activeAccount, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(activeAccount);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    await archiveBankAccount(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: activeAccount.id,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'ARCHIVE',
      entityType: 'bank_account',
      entityId: activeAccount.id,
      oldValue: { status: 'active' },
      newValue: { status: 'archived' },
    });
  });
});
