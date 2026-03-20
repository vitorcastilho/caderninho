import { vi } from 'vitest';

import { updateIncomeSource } from './update-income-source';
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

describe('updateIncomeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update income source and return ok result', async () => {
    const updated = { ...sampleIncomeSource, name: 'Novo Salário' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleIncomeSource);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: sampleIncomeSource.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Novo Salário' },
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Novo Salário');
    }
  });

  it('should return error when income source not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateIncomeSource(
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
      expect(result.error.code).toBe('INCOME_SOURCE_NOT_FOUND');
    }
  });

  it('should register audit log on update', async () => {
    const updated = { ...sampleIncomeSource, name: 'Novo' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleIncomeSource);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateIncomeSource(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        id: sampleIncomeSource.id,
        organizationId: 'org-123',
        userId: 'user-1',
        data: { name: 'Novo' },
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'UPDATE',
        entityType: 'income_source',
      }),
    );
  });
});
