import { vi } from 'vitest';

import { transferBetweenAccounts } from './transfer-between-accounts';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findByOrganizationFiltered: vi.fn(),
  aggregateByTypeForOrganizationFiltered: vi.fn(),
  findTopEstablishments: vi.fn(),
  sumMonthlySpentByCategory: vi.fn(),
  getMonthlySpendingSummary: vi.fn(),
};

const mockBankAccountRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleSourceAccount = {
  id: 'bank-src',
  name: 'Conta Origem',
  bank: 'Nubank',
  balanceCents: 100000,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleDestinationAccount = {
  id: 'bank-dest',
  name: 'Poupança',
  bank: 'Itaú',
  balanceCents: 50000,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleTransaction = {
  id: 'tx-1',
  type: 'transfer',
  amountCents: 30000,
  categoryId: null,
  subcategoryId: null,
  establishment: null,
  paymentMethodType: null,
  paymentMethodId: null,
  installments: null,
  description: null,
  incomeSourceId: null,
  sourceAccountId: 'bank-src',
  destinationAccountId: 'bank-dest',
  transactionDate: new Date(),
  referenceMonth: null,
  organizationId: 'org-123',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseParams = {
  amountCents: 30000,
  sourceAccountId: 'bank-src',
  destinationAccountId: 'bank-dest',
  organizationId: 'org-123',
  userId: 'user-1',
};

describe('transferBetweenAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleTransaction);
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-src') return sampleSourceAccount;
      if (id === 'bank-dest') return sampleDestinationAccount;
      return null;
    });
    vi.mocked(mockBankAccountRepository.update).mockResolvedValue(sampleSourceAccount);
  });

  const deps = {
    repository: mockRepository,
    auditLogger: mockAuditLogger,
    bankAccountRepository: mockBankAccountRepository,
  };

  it('deve criar transferência com sucesso', async () => {
    const result = await transferBetweenAccounts(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('transfer');
    }
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'transfer',
        amountCents: 30000,
        sourceAccountId: 'bank-src',
        destinationAccountId: 'bank-dest',
        categoryId: null,
        paymentMethodType: null,
      }),
    );
  });

  it('deve debitar conta de origem e creditar conta de destino', async () => {
    await transferBetweenAccounts(deps, baseParams);

    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-src',
      'org-123',
      { balanceCents: 100000 - 30000 },
    );
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-dest',
      'org-123',
      { balanceCents: 50000 + 30000 },
    );
  });

  it('deve permitir saldo negativo na conta de origem', async () => {
    const result = await transferBetweenAccounts(deps, {
      ...baseParams,
      amountCents: 200000,
    });

    expect(result.success).toBe(true);
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-src',
      'org-123',
      { balanceCents: 100000 - 200000 },
    );
  });

  it('deve rejeitar mesma conta de origem e destino', async () => {
    const result = await transferBetweenAccounts(deps, {
      ...baseParams,
      destinationAccountId: 'bank-src',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SAME_ACCOUNT');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar valor zero', async () => {
    const result = await transferBetweenAccounts(deps, { ...baseParams, amountCents: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('deve rejeitar quando conta de origem não existe', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-dest') return sampleDestinationAccount;
      return null;
    });

    const result = await transferBetweenAccounts(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SOURCE_ACCOUNT_NOT_FOUND');
    }
  });

  it('deve rejeitar quando conta de destino não existe', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-src') return sampleSourceAccount;
      return null;
    });

    const result = await transferBetweenAccounts(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('DESTINATION_ACCOUNT_NOT_FOUND');
    }
  });

  it('deve rejeitar conta de origem arquivada', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-src') return { ...sampleSourceAccount, status: 'archived' };
      if (id === 'bank-dest') return sampleDestinationAccount;
      return null;
    });

    const result = await transferBetweenAccounts(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SOURCE_ACCOUNT_INACTIVE');
    }
  });

  it('deve registrar auditoria', async () => {
    await transferBetweenAccounts(deps, baseParams);

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'transaction',
      entityId: expect.any(String),
      oldValue: null,
      newValue: {
        type: 'transfer',
        amountCents: 30000,
        sourceAccountId: 'bank-src',
        destinationAccountId: 'bank-dest',
      },
    });
  });
});
