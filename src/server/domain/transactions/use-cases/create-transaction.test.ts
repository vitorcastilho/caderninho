import { vi } from 'vitest';

import { createTransaction } from './create-transaction';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findTopEstablishments: vi.fn(),
};

const mockBankAccountRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleTransaction = {
  id: expect.any(String),
  type: 'expense',
  amountCents: 8700,
  categoryId: 'cat-123',
  subcategoryId: 'sub-123',
  establishment: 'Pão de Açúcar',
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-123',
  description: null,
  transactionDate: expect.any(Date),
  referenceMonth: null,
  organizationId: 'org-123',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseParams = {
  amountCents: 8700,
  categoryId: 'cat-123',
  subcategoryId: 'sub-123',
  establishment: 'Pão de Açúcar',
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-123',
  organizationId: 'org-123',
  userId: 'user-1',
};

const sampleBankAccount = {
  id: 'bank-123',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 50000,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleTransaction as never);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(sampleBankAccount);
    vi.mocked(mockBankAccountRepository.update).mockResolvedValue(sampleBankAccount);
  });

  const deps = {
    repository: mockRepository,
    auditLogger: mockAuditLogger,
    bankAccountRepository: mockBankAccountRepository,
  };

  it('deve criar transacao de debito com sucesso', async () => {
    const result = await createTransaction(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('expense');
      expect(result.data.amountCents).toBe(8700);
    }
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        amountCents: 8700,
        categoryId: 'cat-123',
        paymentMethodType: 'debit',
      }),
    );
  });

  it('deve criar transacao de credito com sucesso', async () => {
    const result = await createTransaction(deps, {
      ...baseParams,
      paymentMethodType: 'credit',
      paymentMethodId: 'cc-123',
    });

    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethodType: 'credit',
        paymentMethodId: 'cc-123',
      }),
    );
  });

  it('deve criar transacao pix com sucesso', async () => {
    const result = await createTransaction(deps, {
      ...baseParams,
      paymentMethodType: 'pix',
      paymentMethodId: 'bank-123',
    });

    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethodType: 'pix',
      }),
    );
  });

  it('deve retornar erro para valor zero', async () => {
    const result = await createTransaction(deps, {
      ...baseParams,
      amountCents: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve retornar erro para valor negativo', async () => {
    const result = await createTransaction(deps, {
      ...baseParams,
      amountCents: -100,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVALID_AMOUNT');
    }
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve debitar saldo da conta apos transacao de debito', async () => {
    await createTransaction(deps, baseParams);

    expect(mockBankAccountRepository.findById).toHaveBeenCalledWith('bank-123', 'org-123');
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-123',
      'org-123',
      { balanceCents: 50000 - 8700 },
    );
  });

  it('deve debitar saldo da conta apos transacao pix', async () => {
    await createTransaction(deps, {
      ...baseParams,
      paymentMethodType: 'pix',
    });

    expect(mockBankAccountRepository.findById).toHaveBeenCalledWith('bank-123', 'org-123');
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith(
      'bank-123',
      'org-123',
      { balanceCents: 50000 - 8700 },
    );
  });

  it('transacao de cartao NAO deve alterar saldo da conta', async () => {
    await createTransaction(deps, {
      ...baseParams,
      paymentMethodType: 'credit',
      paymentMethodId: 'cc-123',
    });

    expect(mockBankAccountRepository.findById).not.toHaveBeenCalled();
    expect(mockBankAccountRepository.update).not.toHaveBeenCalled();
  });

  it('deve registrar auditoria na criacao', async () => {
    await createTransaction(deps, baseParams);

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'transaction',
      entityId: expect.any(String),
      oldValue: null,
      newValue: {
        type: 'expense',
        amountCents: 8700,
        categoryId: 'cat-123',
        paymentMethodType: 'debit',
      },
    });
  });
});
