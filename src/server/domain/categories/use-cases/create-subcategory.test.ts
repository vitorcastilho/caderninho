import { vi } from 'vitest';

import { createSubcategory } from './create-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { CategoryRepository } from '../repositories/category.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockCategoryRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockBankAccountRepository: BankAccountRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockCreditCardRepository: CreditCardRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const deps = {
  repository: mockRepository,
  categoryRepository: mockCategoryRepository,
  bankAccountRepository: mockBankAccountRepository,
  creditCardRepository: mockCreditCardRepository,
  auditLogger: mockAuditLogger,
};

const activeCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

const sampleSubcategory = {
  id: expect.any(String), name: 'Aluguel', categoryId: 'cat-1',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('createSubcategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(activeCategory);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleSubcategory);
  });

  it('should create subcategory successfully', async () => {
    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Aluguel');
  });

  it('should return error when category not found', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue(null);

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when category is archived', async () => {
    vi.mocked(mockCategoryRepository.findById).mockResolvedValue({ ...activeCategory, status: 'archived' });

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_ARCHIVED');
  });

  it('should register audit log', async () => {
    await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'subcategory' }));
  });

  it('should create subcategory with credit card override', async () => {
    const subcategoryWithPayment = {
      ...sampleSubcategory,
      id: 'sub-1',
      defaultPaymentMethodType: 'credit_card',
      defaultPaymentMethodId: 'card-1',
    };
    vi.mocked(mockRepository.create).mockResolvedValue(subcategoryWithPayment);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'active',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'credit_card', defaultPaymentMethodId: 'card-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBe('credit_card');
      expect(result.data.defaultPaymentMethodId).toBe('card-1');
    }
  });

  it('should create subcategory with debit override (bank account)', async () => {
    const subcategoryWithPayment = {
      ...sampleSubcategory,
      id: 'sub-1',
      defaultPaymentMethodType: 'debit',
      defaultPaymentMethodId: 'acc-1',
    };
    vi.mocked(mockRepository.create).mockResolvedValue(subcategoryWithPayment);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Conta Corrente', bank: 'Itaú', balanceCents: 1000000,
      status: 'active', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
  });

  it('should create subcategory without override (null/null)', async () => {
    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(mockCreditCardRepository.findById).not.toHaveBeenCalled();
    expect(mockBankAccountRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when credit card not found', async () => {
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue(null);

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'credit_card', defaultPaymentMethodId: 'card-999',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
  });

  it('should return error when credit card is archived', async () => {
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'archived',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'credit_card', defaultPaymentMethodId: 'card-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });

  it('should return error when bank account not found (debit)', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(null);

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-999',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
  });

  it('should return error when bank account is archived (pix)', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Conta Corrente', bank: 'Itaú', balanceCents: 1000000,
      status: 'archived', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createSubcategory(deps, {
      name: 'Aluguel', categoryId: 'cat-1',
      defaultPaymentMethodType: 'pix', defaultPaymentMethodId: 'acc-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });
});
