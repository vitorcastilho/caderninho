import { vi } from 'vitest';

import { createIncomeSource } from './create-income-source';
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
  id: expect.any(String),
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

describe('createIncomeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleIncomeSource);
  });

  it('should create income source and return ok result', async () => {
    const result = await createIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Salário ACME',
        employmentType: 'clt',
        isRecurring: true,
        baseAmountCents: 800000,
        usualPaymentDay: 25,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Salário ACME');
    }
  });

  it('should register audit log on create', async () => {
    await createIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Salário ACME',
        employmentType: 'clt',
        isRecurring: true,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE',
        entityType: 'income_source',
      }),
    );
  });

  it('should create without optional fields', async () => {
    const noOptionals = { ...sampleIncomeSource, baseAmountCents: null, usualPaymentDay: null };
    vi.mocked(mockRepository.create).mockResolvedValue(noOptionals);

    const result = await createIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Freelance',
        employmentType: 'freelance',
        isRecurring: false,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseAmountCents: null,
        usualPaymentDay: null,
      }),
    );
  });
});
