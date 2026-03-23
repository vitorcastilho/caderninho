import { vi } from 'vitest';

import { reactivateCategory } from './reactivate-category';
import type { CategoryRepository } from '../repositories/category.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByClassification: vi.fn(), countActiveByClassification: vi.fn(),
  update: vi.fn(), updateClassificationBulk: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const archivedCategory = {
  id: 'cat-1', name: 'Moradia', classificationId: 'class-1',
  budgetMinCents: 220000, budgetMaxCents: null,
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  status: 'archived' as const,
  organizationId: 'org-123', createdAt: new Date(), updatedAt: new Date(),
};

describe('reactivateCategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should reactivate category successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedCategory);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...archivedCategory, status: 'active' });

    const result = await reactivateCategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateCategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('should return error when already active', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...archivedCategory, status: 'active' });

    const result = await reactivateCategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'cat-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('CATEGORY_ALREADY_ACTIVE');
  });
});
