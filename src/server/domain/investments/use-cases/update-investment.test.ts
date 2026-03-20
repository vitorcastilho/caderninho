import { vi } from 'vitest';

import { updateInvestment } from './update-investment';
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

describe('updateInvestment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update investment and return ok result', async () => {
    const updated = { ...sampleInvestment, name: 'CDB Banco Y' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: sampleInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'CDB Banco Y' },
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('CDB Banco Y');
    }
  });

  it('should return error when investment not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: 'nonexistent',
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Novo Nome' },
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('INVESTMENT_NOT_FOUND');
    }
  });

  it('should clear yieldRateBasisPoints when changing type to renda_variavel', async () => {
    const updated = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: sampleInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { type: 'renda_variavel' },
      },
    );

    expect(mockRepository.update).toHaveBeenCalledWith(
      sampleInvestment.id,
      'org-123',
      { type: 'renda_variavel', yieldRateBasisPoints: null },
    );
  });

  it('should NOT clear yieldRateBasisPoints when type stays renda_variavel', async () => {
    const rvInvestment = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(rvInvestment);
    vi.mocked(mockRepository.update).mockResolvedValue({ ...rvInvestment, name: 'Novo' });

    await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: rvInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Novo' },
      },
    );

    expect(mockRepository.update).toHaveBeenCalledWith(
      rvInvestment.id,
      'org-123',
      { name: 'Novo' },
    );
  });

  it('should return error when changing from renda_variavel to renda_fixa without yieldRateBasisPoints', async () => {
    const rvInvestment = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(rvInvestment);

    const result = await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: rvInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { type: 'renda_fixa' },
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should return error when changing from renda_variavel to reserva without yieldRateBasisPoints', async () => {
    const rvInvestment = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(rvInvestment);

    const result = await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: rvInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { type: 'reserva' },
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should allow changing from renda_variavel to renda_fixa when yieldRateBasisPoints is provided', async () => {
    const rvInvestment = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
    };
    const updated = {
      ...rvInvestment,
      type: 'renda_fixa' as const,
      yieldRateBasisPoints: 11000,
    };
    vi.mocked(mockRepository.findById).mockResolvedValue(rvInvestment);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: rvInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { type: 'renda_fixa', yieldRateBasisPoints: 11000 },
      },
    );

    expect(result.success).toBe(true);
    expect(mockRepository.update).toHaveBeenCalled();
  });

  it('should register audit log on update', async () => {
    const updated = { ...sampleInvestment, name: 'CDB Banco Y' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleInvestment);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: sampleInvestment.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'CDB Banco Y' },
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        entityType: 'investment',
        entityId: sampleInvestment.id,
      }),
    );
  });
});
