import { vi } from 'vitest';

import { archiveInvestment } from './archive-investment';
import type { InvestmentRepository } from '../repositories/investment.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: InvestmentRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleInvestment = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'CDB Banco X',
  institution: 'Banco X',
  type: 'renda_fixa' as const,
  balanceCents: 1000000,
  yieldRateBasisPoints: 11000,
  lastBalanceUpdate: new Date(),
  maturityDate: '2027-12-31',
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('archiveInvestment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive an active investment', async () => {
    const archived = { ...sampleInvestment, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    const result = await archiveInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: sampleInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('archived');
    }
  });

  it('should return error when investment not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_NOT_FOUND');
    }
  });

  it('should return error when already archived', async () => {
    const archived = { ...sampleInvestment, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archived);

    const result = await archiveInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: sampleInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_ALREADY_ARCHIVED');
    }
  });

  it('should register audit log on archive', async () => {
    const archived = { ...sampleInvestment, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    await archiveInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: sampleInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ARCHIVE',
        entityType: 'investment',
      }),
    );
  });
});
