import { vi } from 'vitest';

import { updateCategory } from './update-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { ClassificationRepository } from '../repositories/classification.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockClassificationRepository: ClassificationRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  countByOrganization: vi.fn(), update: vi.fn(), updateStatus: vi.fn(),
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
  classificationRepository: mockClassificationRepository,
  bankAccountRepository: mockBankAccountRepository,
  creditCardRepository: mockCreditCardRepository,
  auditLogger: mockAuditLogger,
};

const sampleCategory = {
  id: 'cat-1', name: 'Moradia', emoji: '📁', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('updateCategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should update category successfully', async () => {
    const updated = { ...sampleCategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Novo Nome');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when reclassifying to non-existent classification', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue(null);

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { classificationId: 'new-class' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_NOT_FOUND');
  });

  it('should return error when reclassifying to archived classification', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockClassificationRepository.findById).mockResolvedValue({
      id: 'new-class', name: 'Archived', displayOrder: 1, status: 'archived' as const,
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1', data: { classificationId: 'new-class' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CLASSIFICATION_ARCHIVED');
  });

  it('should update payment method to credit card', async () => {
    const updated = { ...sampleCategory, defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'active',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBe('credit');
      expect(result.data.defaultPaymentMethodId).toBe('card-1');
    }
  });

  it('should clear payment method (null/null)', async () => {
    const existing = { ...sampleCategory, defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' };
    const updated = { ...sampleCategory, defaultPaymentMethodType: null, defaultPaymentMethodId: null };
    vi.mocked(mockRepository.findById).mockResolvedValue(existing);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: null, defaultPaymentMethodId: null },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBeNull();
      expect(result.data.defaultPaymentMethodId).toBeNull();
    }
  });

  it('should return error when updating to non-existent credit card', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue(null);

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-999' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
  });

  it('should return error when updating to archived bank account', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Itaú', bank: 'Itaú', balanceCents: 1000000,
      status: 'archived', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'pix', defaultPaymentMethodId: 'acc-1' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });

  it('should include payment method fields in audit log', async () => {
    const updated = { ...sampleCategory, defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Itaú', bank: 'Itaú', balanceCents: 1000000,
      status: 'active', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    await updateCategory(deps, {
      id: 'cat-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1' },
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({
      oldValue: expect.objectContaining({
        defaultPaymentMethodType: null,
        defaultPaymentMethodId: null,
      }),
      newValue: expect.objectContaining({
        defaultPaymentMethodType: 'debit',
        defaultPaymentMethodId: 'acc-1',
      }),
    }));
  });
});
