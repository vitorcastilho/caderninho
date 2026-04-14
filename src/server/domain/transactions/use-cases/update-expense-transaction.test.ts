import { vi } from 'vitest';

import { updateExpenseTransaction } from './update-expense-transaction';
import type { Transaction, TransactionRepository } from '../repositories/transaction.repository';
import type {
  BankAccount,
  BankAccountRepository,
} from '@/server/domain/bank-accounts/repositories/bank-account.repository';
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

const mockAuditLogger: AuditLogger = vi.fn();

const baseExpense: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amountCents: 10000,
  categoryId: 'cat-1',
  subcategoryId: 'sub-1',
  establishment: 'Mercado',
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-a',
  installments: null,
  description: null,
  incomeSourceId: null,
  sourceAccountId: null,
  destinationAccountId: null,
  transactionDate: new Date('2026-04-10T12:00:00Z'),
  referenceMonth: null,
  organizationId: 'org-1',
  createdBy: 'user-1',
  createdAt: new Date('2026-04-10T12:00:00Z'),
  updatedAt: new Date('2026-04-10T12:00:00Z'),
};

const bankA: BankAccount = {
  id: 'bank-a',
  name: 'Conta A',
  bank: 'Nubank',
  balanceCents: 50000,
  status: 'active',
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const bankB: BankAccount = {
  id: 'bank-b',
  name: 'Conta B',
  bank: 'Itaú',
  balanceCents: 20000,
  status: 'active',
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('updateExpenseTransaction', () => {
  const deps = {
    repository: mockRepository,
    auditLogger: mockAuditLogger,
    bankAccountRepository: mockBankAccountRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.findById).mockResolvedValue(baseExpense);
    vi.mocked(mockRepository.update).mockImplementation(
      async (_id, _org, data) => ({ ...baseExpense, ...(data as Partial<Transaction>) }),
    );
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-a') return bankA;
      if (id === 'bank-b') return bankB;
      return null;
    });
    vi.mocked(mockBankAccountRepository.update).mockResolvedValue(bankA);
  });

  it('deve atualizar apenas categoria sem mexer em saldo', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      categoryId: 'cat-2',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(mockRepository.update).toHaveBeenCalledWith(
      'tx-1',
      'org-1',
      expect.objectContaining({ categoryId: 'cat-2' }),
    );
    expect(mockBankAccountRepository.update).not.toHaveBeenCalled();
  });

  it('deve estornar saldo antigo e aplicar novo ao mudar valor em débito', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: 15000,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Estorno: bankA.balance (50000) + amount antigo (10000) = 60000
    // Novo débito: 60000 - 15000 = 45000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 60000,
    });
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 45000,
    });
  });

  it('deve estornar saldo antigo ao trocar débito para crédito (crédito não afeta saldo)', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodType: 'credit',
      paymentMethodId: 'cc-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Estorno em bankA: 50000 + 10000 = 60000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 60000,
    });
    // Apenas 1 update (não há débito em crédito)
    expect(mockBankAccountRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve trocar conta de débito (estorno em A, aplicação em B)', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodId: 'bank-b',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Estorno bankA: 50000 + 10000 = 60000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 60000,
    });
    // Aplicação bankB: 20000 - 10000 = 10000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-b', 'org-1', {
      balanceCents: 10000,
    });
  });

  it('deve retornar TRANSACTION_NOT_FOUND quando transação não existe', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateExpenseTransaction(deps, {
      id: 'missing',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar edição de receita (income)', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...baseExpense, type: 'income' });

    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: 5000,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_TRANSACTION_TYPE');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('deve rejeitar edição de transferência (transfer)', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...baseExpense, type: 'transfer' });

    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: 5000,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_TRANSACTION_TYPE');
  });

  it('deve rejeitar valor zero', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: 0,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_AMOUNT');
  });

  it('deve rejeitar valor negativo', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: -100,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_AMOUNT');
  });

  it('deve rejeitar paymentMethodType inválido', async () => {
    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodType: 'bitcoin',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('INVALID_PAYMENT_METHOD');
  });

  it('deve retornar DESTINATION_ACCOUNT_NOT_FOUND quando nova conta não existe', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-a') return bankA;
      return null;
    });

    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodId: 'bank-z',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('DESTINATION_ACCOUNT_NOT_FOUND');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('deve retornar DESTINATION_ACCOUNT_INACTIVE quando nova conta está arquivada', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-a') return bankA;
      if (id === 'bank-b') return { ...bankB, status: 'archived' };
      return null;
    });

    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodId: 'bank-b',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('DESTINATION_ACCOUNT_INACTIVE');
  });

  it('deve registrar auditoria com oldValue e newValue', async () => {
    await updateExpenseTransaction(deps, {
      id: 'tx-1',
      amountCents: 15000,
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        organizationId: 'org-1',
        action: 'UPDATE',
        entityType: 'transaction',
        entityId: 'tx-1',
        oldValue: expect.objectContaining({ amountCents: 10000 }),
        newValue: expect.objectContaining({ amountCents: 15000 }),
      }),
    );
  });

  it('não deve bloquear a edição se a conta antiga não existir mais', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      // Conta antiga (bank-a) sumiu; só existe a nova (bank-b)
      if (id === 'bank-b') return bankB;
      return null;
    });

    const result = await updateExpenseTransaction(deps, {
      id: 'tx-1',
      paymentMethodId: 'bank-b',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Apenas a aplicação na conta nova (sem estorno na sumida)
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-b', 'org-1', {
      balanceCents: 10000,
    });
  });
});
