import { vi } from 'vitest';

import { createInvestment } from './create-investment';
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
  id: expect.any(String),
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

describe('createInvestment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleInvestment);
  });

  it('should create investment and return ok result', async () => {
    const result = await createInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'CDB Banco X',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
        maturityDate: '2027-12-31',
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('CDB Banco X');
      expect(result.data.type).toBe('renda_fixa');
    }
    expect(mockRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'CDB Banco X',
      institution: 'Banco X',
      type: 'renda_fixa',
      balanceCents: 1000000,
      yieldRateBasisPoints: 11000,
      maturityDate: '2027-12-31',
      organizationId: 'org-123',
    });
  });

  it('should register audit log on create', async () => {
    await createInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'CDB Banco X',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'investment',
      entityId: expect.any(String),
      oldValue: null,
      newValue: {
        name: 'CDB Banco X',
        institution: 'Banco X',
        type: 'renda_fixa',
        balanceCents: 1000000,
        yieldRateBasisPoints: 11000,
      },
    });
  });

  it('should create renda_variavel without yieldRateBasisPoints', async () => {
    const rvInvestment = {
      ...sampleInvestment,
      type: 'renda_variavel' as const,
      yieldRateBasisPoints: null,
      maturityDate: null,
    };
    vi.mocked(mockRepository.create).mockResolvedValue(rvInvestment);

    const result = await createInvestment(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Ações PETR4',
        institution: 'Corretora Y',
        type: 'renda_variavel',
        balanceCents: 500000,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'Ações PETR4',
      institution: 'Corretora Y',
      type: 'renda_variavel',
      balanceCents: 500000,
      yieldRateBasisPoints: null,
      maturityDate: null,
      organizationId: 'org-123',
    });
  });
});
