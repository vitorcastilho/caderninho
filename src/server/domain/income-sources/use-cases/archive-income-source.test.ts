import { vi } from 'vitest';

import { archiveIncomeSource } from './archive-income-source';
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

const sampleIncomeSource = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Salário ACME',
  employmentType: 'clt' as const,
  isRecurring: true,
  baseAmountCents: 800000,
  usualPaymentDay: 25,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('archiveIncomeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive an active income source', async () => {
    const archived = { ...sampleIncomeSource, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleIncomeSource);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    const result = await archiveIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: sampleIncomeSource.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('archived');
    }
  });

  it('should return error when not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_NOT_FOUND');
    }
  });

  it('should return error when already archived', async () => {
    const archived = { ...sampleIncomeSource, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archived);

    const result = await archiveIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: sampleIncomeSource.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INCOME_SOURCE_ALREADY_ARCHIVED');
    }
  });
});
