import { vi } from 'vitest';

import { getImpactPreview } from './get-impact-preview';
import type { TransactionRepository } from '../repositories/transaction.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';

const mockTransactionRepository: TransactionRepository = {
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

const sampleBankAccount = {
  id: 'bank-123',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 421300,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseParams = {
  amountCents: 8700,
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-123',
  categoryId: 'cat-123',
  categoryName: 'Supermercado',
  categoryBudgetCents: 300000,
  paymentMethodLabel: 'Nubank Conta Corrente',
  organizationId: 'org-123',
};

const deps = {
  bankAccountRepository: mockBankAccountRepository,
  transactionRepository: mockTransactionRepository,
};

describe('getImpactPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(sampleBankAccount);
    vi.mocked(mockTransactionRepository.findByOrganization).mockResolvedValue([]);
  });

  it('deve calcular impacto com debito (saldo diminui)', async () => {
    const result = await getImpactPreview(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balanceBefore).toBe(421300);
      expect(result.data.balanceAfter).toBe(421300 - 8700);
    }
  });

  it('deve calcular impacto com credito (sem busca de conta)', async () => {
    const result = await getImpactPreview(deps, {
      ...baseParams,
      paymentMethodType: 'credit',
      paymentMethodId: 'cc-123',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balanceBefore).toBe(0);
      expect(result.data.balanceAfter).toBe(-8700);
    }
    expect(mockBankAccountRepository.findById).not.toHaveBeenCalled();
  });

  it('deve calcular orcamento abaixo de 70%', async () => {
    // Com 0 gasto anterior + 8700 de novo gasto = 8700 / 300000 = 2.9%
    const result = await getImpactPreview(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budgetPercentage).toBe(3); // Math.round(8700/300000*100)
      expect(result.data.budgetSpent).toBe(8700);
      expect(result.data.budgetTotal).toBe(300000);
    }
  });

  it('deve calcular orcamento entre 70-85%', async () => {
    // Gastos anteriores: 200000 + novo: 8700 = 208700 / 300000 = 69.5% → Math.round = 70%
    vi.mocked(mockTransactionRepository.findByOrganization).mockResolvedValue([
      {
        id: 'tx-1',
        type: 'expense',
        amountCents: 200000,
        categoryId: 'cat-123',
        subcategoryId: null,
        establishment: null,
        paymentMethodType: 'debit',
        paymentMethodId: null,
        description: null,
        transactionDate: new Date(),
        referenceMonth: null,
        organizationId: 'org-123',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getImpactPreview(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budgetSpent).toBe(208700);
      expect(result.data.budgetPercentage).toBe(70);
    }
  });

  it('deve calcular orcamento entre 85-100%', async () => {
    // Gastos anteriores: 250000 + novo: 8700 = 258700 / 300000 = 86.2%
    vi.mocked(mockTransactionRepository.findByOrganization).mockResolvedValue([
      {
        id: 'tx-1',
        type: 'expense',
        amountCents: 250000,
        categoryId: 'cat-123',
        subcategoryId: null,
        establishment: null,
        paymentMethodType: 'debit',
        paymentMethodId: null,
        description: null,
        transactionDate: new Date(),
        referenceMonth: null,
        organizationId: 'org-123',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getImpactPreview(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budgetSpent).toBe(258700);
      expect(result.data.budgetPercentage).toBe(86);
    }
  });

  it('deve calcular orcamento acima de 100%', async () => {
    // Gastos anteriores: 295000 + novo: 8700 = 303700 / 300000 = 101.2%
    vi.mocked(mockTransactionRepository.findByOrganization).mockResolvedValue([
      {
        id: 'tx-1',
        type: 'expense',
        amountCents: 295000,
        categoryId: 'cat-123',
        subcategoryId: null,
        establishment: null,
        paymentMethodType: 'debit',
        paymentMethodId: null,
        description: null,
        transactionDate: new Date(),
        referenceMonth: null,
        organizationId: 'org-123',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getImpactPreview(deps, baseParams);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.budgetSpent).toBe(303700);
      expect(result.data.budgetPercentage).toBe(101);
    }
  });

  it('deve calcular impacto com pix (saldo diminui)', async () => {
    const result = await getImpactPreview(deps, {
      ...baseParams,
      paymentMethodType: 'pix',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balanceBefore).toBe(421300);
      expect(result.data.balanceAfter).toBe(421300 - 8700);
    }
  });
});
