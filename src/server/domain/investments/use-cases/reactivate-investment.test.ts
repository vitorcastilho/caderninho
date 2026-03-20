import { vi } from 'vitest';

import { reactivateInvestment } from './reactivate-investment';
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

const archivedInvestment = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'CDB Banco X',
  institution: 'Banco X',
  type: 'renda_fixa' as const,
  balanceCents: 1000000,
  yieldRateBasisPoints: 11000,
  lastBalanceUpdate: new Date(),
  maturityDate: '2027-12-31',
  status: 'archived' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reactivateInvestment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate an archived investment', async () => {
    const reactivated = { ...archivedInvestment, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedInvestment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    const result = await reactivateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: archivedInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should return error when investment not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_NOT_FOUND');
    }
  });

  it('should return error when already active', async () => {
    const active = { ...archivedInvestment, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(active);

    const result = await reactivateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: archivedInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_ALREADY_ACTIVE');
    }
  });

  it('should register audit log on reactivate', async () => {
    const reactivated = { ...archivedInvestment, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedInvestment);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    await reactivateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: archivedInvestment.id, organizationId: 'org-123', userId: 'user-1' },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'REACTIVATE',
        entityType: 'investment',
      }),
    );
  });
});
