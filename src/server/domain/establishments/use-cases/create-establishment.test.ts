import { vi } from 'vitest';

import { createEstablishment } from './create-establishment';
import type { EstablishmentRepository } from '../repositories/establishment.repository';
import type { SubcategoryRepository } from '@/server/domain/categories/repositories/subcategory.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: EstablishmentRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findBySubcategory: vi.fn(),
  findByNameAndSubcategory: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
  incrementVisitCount: vi.fn(),
};

const mockSubcategoryRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const deps = {
  repository: mockRepository,
  subcategoryRepository: mockSubcategoryRepository,
  auditLogger: mockAuditLogger,
};

const activeSubcategory = {
  id: 'sub-1', name: 'Supermercado', emoji: '📋', categoryId: 'cat-1',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

const sampleEstablishment = {
  id: expect.any(String), name: 'Pão de Açúcar', emoji: '📍',
  subcategoryId: 'sub-1', source: 'manual' as const,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  budgetMinCents: null, budgetMaxCents: null,
  visitCount: 0, lastVisitAt: null,
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('createEstablishment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockSubcategoryRepository.findById).mockResolvedValue(activeSubcategory);
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(null);
    vi.mocked(mockRepository.create).mockResolvedValue(sampleEstablishment);
  });

  it('should create establishment successfully', async () => {
    const result = await createEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Pão de Açúcar');
      expect(result.data.source).toBe('manual');
    }
  });

  it('should create with custom emoji', async () => {
    const withEmoji = { ...sampleEstablishment, emoji: '🛒' };
    vi.mocked(mockRepository.create).mockResolvedValue(withEmoji);

    const result = await createEstablishment(deps, {
      name: 'Pão de Açúcar', emoji: '🛒', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({ emoji: '🛒' }));
  });

  it('should return error when subcategory not found', async () => {
    vi.mocked(mockSubcategoryRepository.findById).mockResolvedValue(null);

    const result = await createEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should return error when subcategory is archived', async () => {
    vi.mocked(mockSubcategoryRepository.findById).mockResolvedValue({ ...activeSubcategory, status: 'archived' });

    const result = await createEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_ARCHIVED');
  });

  it('should return error when duplicate name in same subcategory', async () => {
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(sampleEstablishment);

    const result = await createEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('ESTABLISHMENT_DUPLICATE');
  });

  it('should register audit log', async () => {
    await createEstablishment(deps, {
      name: 'Pão de Açúcar', subcategoryId: 'sub-1',
      organizationId: 'org-123', userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({
      action: 'CREATE',
      entityType: 'establishment',
    }));
  });
});
