import { vi } from 'vitest';

import { reactivateIncomeSource } from './reactivate-income-source';
import type { IncomeSourceRepository } from '../repositories/income-source.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: IncomeSourceRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const archivedIncomeSource = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Salário ACME',
  employmentType: 'clt' as const,
  isRecurring: true,
  baseAmountCents: 800000,
  usualPaymentDay: 25,
  status: 'archived' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reactivateIncomeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate an archived income source', async () => {
    const reactivated = { ...archivedIncomeSource, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedIncomeSource);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    const result = await reactivateIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: archivedIncomeSource.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_NOT_FOUND');
    }
  });

  it('should return error when already active', async () => {
    const active = { ...archivedIncomeSource, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(active);

    const result = await reactivateIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: archivedIncomeSource.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_ALREADY_ACTIVE');
    }
  });
});
