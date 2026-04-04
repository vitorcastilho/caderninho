import { vi } from 'vitest';

import { createCategory } from './create-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(),
  countActiveByClassification: vi.fn(),
  update: vi.fn(),
  updateClassificationBulk: vi.fn(),
  updateStatus: vi.fn(),
};

const mockClassificationRepository: ClassificationRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockBankAccountRepository: BankAccountRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockCreditCardRepository: CreditCardRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const deps = {
  repository: mockRepository,
  classificationRepository: mockClassificationRepository,
  bankAccountRepository: mockBankAccountRepository,
  creditCardRepository: mockCreditCardRepository,
  auditLogger: mockAuditLogger,
};

const activeClassification = {
  id: 'class-1', name: 'Essenciais', displayOrder: 1, status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

const sampleCategory = {
  id: expect.any(String), name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('createCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(activeClassification);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleCategory);
  });

  it('should create category successfully', async () => {
    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: 220000, budgetMaxCents: null,
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Moradia');
  });

  it('should return error when classification not found', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(null);

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when classification is archived', async () => {
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue({ ...activeClassification, status: 'archived' });

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ARCHIVED');
  });

  it('should register audit log', async () => {
    await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: 220000, budgetMaxCents: null,
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'CREATE', entityType: 'category' }));
  });

  it('should create category with credit card payment method', async () => {
    const categoryWithPayment = {
      ...sampleCategory,
      defaultPaymentMethodType: 'credit',
      defaultPaymentMethodId: 'card-1',
    };
    vi.mocked(mockRepository.create).mockResolvedValue(categoryWithPayment);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'active',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBe('credit');
      expect(result.data.defaultPaymentMethodId).toBe('card-1');
    }
  });

  it('should create category with debit payment method', async () => {
    const categoryWithPayment = {
      ...sampleCategory,
      defaultPaymentMethodType: 'debit',
      defaultPaymentMethodId: 'acc-1',
    };
    vi.mocked(mockRepository.create).mockResolvedValue(categoryWithPayment);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Itaú', bank: 'Itaú', balanceCents: 1000000,
      status: 'active', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
  });

  it('should return error when credit card not found', async () => {
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue(null);

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-999',
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

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });

  it('should return error when bank account not found (debit)', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue(null);

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-999',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
  });

  it('should return error when bank account is archived (pix)', async () => {
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Itaú', bank: 'Itaú', balanceCents: 1000000,
      status: 'archived', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'pix', defaultPaymentMethodId: 'acc-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });

  it('should include payment method fields in audit log', async () => {
    const categoryWithPayment = {
      ...sampleCategory,
      defaultPaymentMethodType: 'credit',
      defaultPaymentMethodId: 'card-1',
    };
    vi.mocked(mockRepository.create).mockResolvedValue(categoryWithPayment);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'active',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    await createCategory(deps, {
      name: 'Moradia', classificationId: 'class-1', budgetMinCents: null, budgetMaxCents: null,
      defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({
      newValue: expect.objectContaining({
        defaultPaymentMethodType: 'credit',
        defaultPaymentMethodId: 'card-1',
      }),
    }));
  });
});
