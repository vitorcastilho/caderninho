import { vi } from 'vitest';

import { createIncome } from './create-income';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { IncomeSourceRepository } from '@/server/domain/income-sources/repositories/income-source.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
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

const mockIncomeSourceRepository: IncomeSourceRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleIncomeSource = {
  id: 'src-123',
  name: 'Salário PJ',
  employmentType: 'pj_propria' as const,
  isRecurring: true,
  baseAmountCents: 500000,
  usualPaymentDay: 5,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleBankAccount = {
  id: 'bank-dest',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 200000,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleTransaction = {
  id: 'tx-1',
  type: 'income',
  amountCents: 500000,
  categoryId: null,
  subcategoryId: null,
  establishment: null,
  paymentMethodType: null,
  paymentMethodId: null,
  installments: null,
  description: null,
  incomeSourceId: 'src-123',
  sourceAccountId: null,
  destinationAccountId: 'bank-dest',
  transactionDate: new Date(),
  referenceMonth: null,
  organizationId: 'org-123',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseParams = {
  amountCents: 500000,
  incomeSourceId: 'src-123',
  destinationAccountId: 'bank-dest',
  organizationId: 'org-123',
  userId: 'user-1',
};

describe('createIncome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleTransaction);
    vi.mocked(mockIncomeSourceRepository.findById).mockResolvedValue(sampleIncomeSource);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(sampleBankAccount);
    vi.mocked(mockBankAccountRepository.update).mockResolvedValue(sampleBankAccount);
  });

  const deps = {
    repository: mockRepository,
    auditLogger: mockAuditLogger,
    bankAccountRepository: mockBankAccountRepository,
    incomeSourceRepository: mockIncomeSourceRepository,
  };

  it('deve criar receita com sucesso', async () => {
    const result = await createIncome(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('income');
      expect(result.data.amountCents).toBe(500000);
    }
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        amountCents: 500000,
        incomeSourceId: 'src-123',
        destinationAccountId: 'bank-dest',
        categoryId: null,
        paymentMethodType: null,
      }),
    );
  });

  it('deve creditar saldo da conta de destino', async () => {
    await createIncome(deps, baseParams);

    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-dest',
      'org-123',
      { balanceCents: 200000 + 500000 },
    );
  });

  it('deve rejeitar valor zero', async () => {
    const result = await createIncome(deps, { ...baseParams, amountCents: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar valor negativo', async () => {
    const result = await createIncome(deps, { ...baseParams, amountCents: -100 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
  });

  it('deve rejeitar quando income source não existe', async () => {
    vi.mocked(mockIncomeSourceRepository.findById).mockResolvedValue(null);

    const result = await createIncome(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_NOT_FOUND');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando income source está arquivada', async () => {
    vi.mocked(mockIncomeSourceRepository.findById).mockResolvedValue({
      ...sampleIncomeSource,
      status: 'archived',
    });

    const result = await createIncome(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_INACTIVE');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando conta destino não existe', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(null);

    const result = await createIncome(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('DESTINATION_ACCOUNT_NOT_FOUND');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve rejeitar quando conta destino está arquivada', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      ...sampleBankAccount,
      status: 'archived',
    });

    const result = await createIncome(deps, baseParams);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('DESTINATION_ACCOUNT_INACTIVE');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
    expect(mockBankAccountRepository.update).not.toHaveBeenCalled();
  });

  it('deve registrar auditoria', async () => {
    await createIncome(deps, baseParams);

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'transaction',
      entityId: expect.any(String),
      oldValue: null,
      newValue: {
        type: 'income',
        amountCents: 500000,
        incomeSourceId: 'src-123',
        destinationAccountId: 'bank-dest',
      },
    });
  });
});
