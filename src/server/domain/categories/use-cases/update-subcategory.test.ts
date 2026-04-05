import { vi } from 'vitest';

import { updateSubcategory } from './update-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { BankAccountRepository } from '@/server/domain/bank-accounts/repositories/bank-account.repository';
import type { CreditCardRepository } from '@/server/domain/credit-cards/repositories/credit-card.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
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
  bankAccountRepository: mockBankAccountRepository,
  creditCardRepository: mockCreditCardRepository,
  auditLogger: mockAuditLogger,
};

const sampleSubcategory = {
  id: 'sub-1', name: 'Aluguel', emoji: '📋', categoryId: 'cat-1',
  defaultPaymentMethodType: null as string | null,
  defaultPaymentMethodId: null as string | null,
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('updateSubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should update subcategory name successfully', async () => {
    const updated = { ...sampleSubcategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Novo Nome');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should register audit log', async () => {
    const updated = { ...sampleSubcategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' },
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'subcategory' }));
  });

  it('should add payment method override (credit card)', async () => {
    const updated = { ...sampleSubcategory, defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue({
      id: 'card-1', name: 'Latam Pass', brand: 'Visa', limitCents: 500000,
      closingDay: 10, dueDay: 20, status: 'active',
      organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBe('credit');
      expect(result.data.defaultPaymentMethodId).toBe('card-1');
    }
  });

  it('should change payment method override', async () => {
    const existing = { ...sampleSubcategory, defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' };
    const updated = { ...sampleSubcategory, defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1' };
    vi.mocked(mockRepository.findById).mockResolvedValue(existing);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Conta Corrente', bank: 'Itaú', balanceCents: 1000000,
      status: 'active', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1' },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBe('debit');
      expect(result.data.defaultPaymentMethodId).toBe('acc-1');
    }
  });

  it('should remove payment method override (set null)', async () => {
    const existing = { ...sampleSubcategory, defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-1' };
    const updated = { ...sampleSubcategory, defaultPaymentMethodType: null, defaultPaymentMethodId: null };
    vi.mocked(mockRepository.findById).mockResolvedValue(existing);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: null, defaultPaymentMethodId: null },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.defaultPaymentMethodType).toBeNull();
      expect(result.data.defaultPaymentMethodId).toBeNull();
    }
    expect(mockCreditCardRepository.findById).not.toHaveBeenCalled();
    expect(mockBankAccountRepository.findById).not.toHaveBeenCalled();
  });

  it('should return error when credit card not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockCreditCardRepository.findById).mockResolvedValue(null);

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'credit', defaultPaymentMethodId: 'card-999' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_NOT_FOUND');
  });

  it('should return error when bank account is archived', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Conta Corrente', bank: 'Itaú', balanceCents: 1000000,
      status: 'archived', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
      data: { defaultPaymentMethodType: 'pix', defaultPaymentMethodId: 'acc-1' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('PAYMENT_METHOD_ARCHIVED');
  });

  it('should include payment method fields in audit log', async () => {
    const existing = { ...sampleSubcategory, defaultPaymentMethodType: null, defaultPaymentMethodId: null };
    const updated = { ...sampleSubcategory, defaultPaymentMethodType: 'debit', defaultPaymentMethodId: 'acc-1' };
    vi.mocked(mockRepository.findById).mockResolvedValue(existing);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);
    vi.mocked(mockBankAccountRepository.findById).mockResolvedValue({
      id: 'acc-1', name: 'Conta Corrente', bank: 'Itaú', balanceCents: 1000000,
      status: 'active', organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
    });

    await updateSubcategory(deps, {
      id: 'sub-1', organizationId: 'org-123', userId: 'user-1',
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
