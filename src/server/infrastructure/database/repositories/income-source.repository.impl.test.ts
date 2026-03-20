import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleIncomeSourceRepository } from './income-source.repository.impl';

const mockDb = db as unknown as {
  insert: Mock;
  select: Mock;
  update: Mock;
};

function mockInsertChain(returnValue: unknown) {
  const values = vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([returnValue]) });
  mockDb.insert.mockReturnValue({ values });
}

function mockSelectChain(returnValue: unknown[]) {
  const where = vi.fn().mockResolvedValue(returnValue);
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValue({ from });
}

function mockUpdateChain(returnValue: unknown) {
  const returning = vi.fn().mockResolvedValue([returnValue]);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValue({ set });
}

const repository = new DrizzleIncomeSourceRepository();

const sampleIncomeSource = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Salário ACME',
  employmentType: 'clt' as const,
  isRecurring: true,
  baseAmountCents: 800000,
  usualPaymentDay: 25,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleIncomeSourceRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created income source', async () => {
      mockInsertChain(sampleIncomeSource);

      const result = await repository.create({
        id: sampleIncomeSource.id,
        name: sampleIncomeSource.name,
        employmentType: sampleIncomeSource.employmentType,
        isRecurring: sampleIncomeSource.isRecurring,
        baseAmountCents: sampleIncomeSource.baseAmountCents,
        usualPaymentDay: sampleIncomeSource.usualPaymentDay,
        organizationId: sampleIncomeSource.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleIncomeSource);
    });
  });

  describe('findById', () => {
    it('should return income source when found', async () => {
      mockSelectChain([sampleIncomeSource]);

      const result = await repository.findById(sampleIncomeSource.id, sampleIncomeSource.organizationId);

      expect(result).toEqual(sampleIncomeSource);
    });

    it('should return null when not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return income sources for organization', async () => {
      mockSelectChain([sampleIncomeSource]);

      const result = await repository.findAllByOrganization('org-123');

      expect(result).toEqual([sampleIncomeSource]);
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleIncomeSource]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update fields and return updated income source', async () => {
      const updated = { ...sampleIncomeSource, name: 'Novo Salário' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleIncomeSource.id, sampleIncomeSource.organizationId, {
        name: 'Novo Salário',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated income source', async () => {
      const archived = { ...sampleIncomeSource, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleIncomeSource.id,
        sampleIncomeSource.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
