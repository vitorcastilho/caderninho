import { vi } from 'vitest';

import { reactivateSubcategory } from './reactivate-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const archivedSubcategory = {
  id: 'sub-1', name: 'Aluguel', emoji: '📋', categoryId: 'cat-1',
  status: 'archived' as const, organizationId: 'org-123',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('reactivateSubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should reactivate subcategory successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedSubcategory);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...archivedSubcategory, status: 'active' });

    const result = await reactivateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should return error when already active', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...archivedSubcategory, status: 'active' });

    const result = await reactivateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_ALREADY_ACTIVE');
  });
});
