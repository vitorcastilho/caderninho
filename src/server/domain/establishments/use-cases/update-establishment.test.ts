import { vi } from 'vitest';

import { updateEstablishment } from './update-establishment';
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

const sampleEstablishment = {
  id: 'est-1', name: 'Pão de Açúcar', emoji: '📍',
  subcategoryId: 'sub-1', source: 'manual' as const,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  budgetMinCents: null, budgetMaxCents: null,
  visitCount: 3, lastVisitAt: new Date(),
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('updateEstablishment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should update name successfully', async () => {
    const updated = { ...sampleEstablishment, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(null);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Novo Nome');
  });

  it('should update emoji successfully', async () => {
    const updated = { ...sampleEstablishment, emoji: '🏪' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { emoji: '🏪' },
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.emoji).toBe('🏪');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { name: 'Novo Nome' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('ESTABLISHMENT_NOT_FOUND');
  });

  it('should return error when moving to non-existent subcategory', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockSubcategoryRepository.findById).mockResolvedValue(null);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { subcategoryId: 'sub-999' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should return error when moving to archived subcategory', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockSubcategoryRepository.findById).mockResolvedValue({
      id: 'sub-2', name: 'Outra', categoryId: 'cat-1',
      defaultPaymentMethodType: null, defaultPaymentMethodId: null,
      status: 'archived' as const, organizationId: 'org-123',
      createdAt: new Date(), updatedAt: new Date(),
    });

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { subcategoryId: 'sub-2' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_ARCHIVED');
  });

  it('should return error on duplicate name in same subcategory', async () => {
    const otherEstablishment = { ...sampleEstablishment, id: 'est-2', name: 'Carrefour' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(otherEstablishment);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { name: 'Carrefour' },
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('ESTABLISHMENT_DUPLICATE');
  });

  it('should allow same name if same establishment (no actual change)', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.update).mockResolvedValue(sampleEstablishment);

    const result = await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { name: 'Pão de Açúcar' },
    });

    // name didn't change, so no duplicate check triggers
    expect(result.success).toBe(true);
  });

  it('should register audit log', async () => {
    const updated = { ...sampleEstablishment, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.findByNameAndSubcategory).mockResolvedValue(null);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
      data: { name: 'Novo Nome' },
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({
      action: 'UPDATE',
      entityType: 'establishment',
    }));
  });
});
