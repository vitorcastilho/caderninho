import { vi } from 'vitest';

import { deleteTransaction } from './delete-transaction';
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
  balanceCents: 30000,
  status: 'active',
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const expenseDebit: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amountCents: 7500,
  categoryId: 'cat-1',
  subcategoryId: 'sub-1',
  establishment: 'Padaria',
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

const expenseCredit: Transaction = {
  ...expenseDebit,
  id: 'tx-2',
  paymentMethodType: 'credit',
  paymentMethodId: 'cc-1',
};

const incomeTx: Transaction = {
  ...expenseDebit,
  id: 'tx-3',
  type: 'income',
  paymentMethodType: null,
  paymentMethodId: null,
  categoryId: null,
  subcategoryId: null,
  establishment: null,
  incomeSourceId: 'src-1',
  destinationAccountId: 'bank-a',
  amountCents: 20000,
};

const transferTx: Transaction = {
  ...expenseDebit,
  id: 'tx-4',
  type: 'transfer',
  paymentMethodType: null,
  paymentMethodId: null,
  categoryId: null,
  subcategoryId: null,
  establishment: null,
  sourceAccountId: 'bank-a',
  destinationAccountId: 'bank-b',
  amountCents: 10000,
};

describe('deleteTransaction', () => {
  const deps = {
    repository: mockRepository,
    auditLogger: mockAuditLogger,
    bankAccountRepository: mockBankAccountRepository,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockBankAccountRepository.findById).mockImplementation(async (id) => {
      if (id === 'bank-a') return bankA;
      if (id === 'bank-b') return bankB;
      return null;
    });
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
  });

  it('deve excluir gasto em débito e estornar saldo na conta', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(expenseDebit);

    const result = await deleteTransaction(deps, {
      id: 'tx-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Estorno: 50000 + 7500 = 57500
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 57500,
    });
    expect(mockRepository.delete).toHaveBeenCalledWith('tx-1', 'org-1');
  });

  it('deve excluir gasto em crédito sem afetar saldo', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(expenseCredit);

    const result = await deleteTransaction(deps, {
      id: 'tx-2',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(mockBankAccountRepository.update).not.toHaveBeenCalled();
    expect(mockRepository.delete).toHaveBeenCalledWith('tx-2', 'org-1');
  });

  it('deve excluir receita debitando saldo da conta destino', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(incomeTx);

    const result = await deleteTransaction(deps, {
      id: 'tx-3',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Débito: 50000 - 20000 = 30000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 30000,
    });
  });

  it('deve excluir transferência revertendo ambas as contas', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(transferTx);

    const result = await deleteTransaction(deps, {
      id: 'tx-4',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    // Créditar origem (reversa do débito original): 50000 + 10000 = 60000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-a', 'org-1', {
      balanceCents: 60000,
    });
    // Debitar destino (reversa do crédito original): 30000 - 10000 = 20000
    expect(mockBankAccountRepository.update).toHaveBeenCalledWith('bank-b', 'org-1', {
      balanceCents: 20000,
    });
  });

  it('deve retornar TRANSACTION_NOT_FOUND quando transação não existe', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await deleteTransaction(deps, {
      id: 'missing',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('não deve bloquear a exclusão se a conta referenciada não existe', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(expenseDebit);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(null);

    const result = await deleteTransaction(deps, {
      id: 'tx-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(mockBankAccountRepository.update).not.toHaveBeenCalled();
    expect(mockRepository.delete).toHaveBeenCalled();
  });

  it('deve registrar auditoria com snapshot completo em oldValue e newValue null', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(expenseDebit);

    await deleteTransaction(deps, {
      id: 'tx-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        organizationId: 'org-1',
        action: 'DELETE',
        entityType: 'transaction',
        entityId: 'tx-1',
        oldValue: expect.objectContaining({
          type: 'expense',
          amountCents: 7500,
          paymentMethodType: 'debit',
          paymentMethodId: 'bank-a',
        }),
        newValue: null,
      }),
    );
  });

  it('deve retornar id e snapshot completo no sucesso', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(expenseDebit);

    const result = await deleteTransaction(deps, {
      id: 'tx-1',
      organizationId: 'org-1',
      userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('tx-1');
      expect(result.data.snapshot).toMatchObject({
        id: 'tx-1',
        type: 'expense',
        amountCents: 7500,
      });
    }
  });
});
