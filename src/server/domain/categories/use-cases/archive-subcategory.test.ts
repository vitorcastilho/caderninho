import { vi } from 'vitest';

import { archiveSubcategory } from './archive-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleSubcategory = {
  id: 'sub-1', name: 'Aluguel', emoji: '📋', categoryId: 'cat-1',
  status: 'active' as const, organizationId: 'org-123',
  defaultPaymentMethodType: null, defaultPaymentMethodId: null,
  createdAt: new Date(), updatedAt: new Date(),
};

describe('archiveSubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should archive subcategory successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...sampleSubcategory, status: 'archived' });

    const result = await archiveSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should return error when already archived', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...sampleSubcategory, status: 'archived' });

    const result = await archiveSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_ALREADY_ARCHIVED');
  });
});
