import { vi } from 'vitest';

import { deleteEstablishment } from './delete-establishment';
import type { EstablishmentRepository } from '../repositories/establishment.repository';
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

const mockAuditLogger: AuditLogger = vi.fn();

const deps = {
  repository: mockRepository,
  auditLogger: mockAuditLogger,
};

const sampleEstablishment = {
  id: 'est-1', name: 'Pão de Açúcar', emoji: '📍',
  subcategoryId: 'sub-1', source: 'manual' as const,
  visitCount: 3, lastVisitAt: new Date(),
  status: 'active' as const, organizationId: 'org-123',
  createdAt: new Date(), updatedAt: new Date(),
};

describe('deleteEstablishment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should archive establishment successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...sampleEstablishment, status: 'archived' });

    const result = await deleteEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe('archived');
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await deleteEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('ESTABLISHMENT_NOT_FOUND');
  });

  it('should register audit log with DELETE action', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleEstablishment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue({ ...sampleEstablishment, status: 'archived' });

    await deleteEstablishment(deps, {
      id: 'est-1', organizationId: 'org-123', userId: 'user-1',
    });

    expect(mockAuditLogger).toHaveBeenCalledWith(expect.objectContaining({
      action: 'DELETE',
      entityType: 'establishment',
      oldValue: expect.objectContaining({ status: 'active' }),
      newValue: expect.objectContaining({ status: 'archived' }),
    }));
  });
});
