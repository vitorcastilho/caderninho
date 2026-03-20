import { vi } from 'vitest';

import { updateSubcategory } from './update-subcategory';
import type { SubcategoryRepository } from '../repositories/subcategory.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: SubcategoryRepository = {
  create: vi.fn(), findById: vi.fn(), findAllByOrganization: vi.fn(),
  findByCategory: vi.fn(), countActiveByCategory: vi.fn(),
  update: vi.fn(), updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleSubcategory = {
  id: 'sub-1', name: 'Aluguel', categoryId: 'cat-1',
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('updateSubcategory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should update subcategory successfully', async () => {
    const updated = { ...sampleSubcategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe('Novo Nome');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('SUBCATEGORY_NOT_FOUND');
  });

  it('should register audit log', async () => {
    const updated = { ...sampleSubcategory, name: 'Novo Nome' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleSubcategory);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateSubcategory(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'sub-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Nome' } },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({ action: 'UPDATE', entityType: 'subcategory' }));
  });
});
