import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleInvestmentRepository } from './investment.repository.impl';

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

const repository = new DrizzleInvestmentRepository();

const sampleInvestment = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'CDB Banco X',
  institution: 'Banco X',
  type: 'renda_fixa' as const,
  balanceCents: 1000000,
  yieldRateBasisPoints: 11000,
  lastBalanceUpdate: new Date('2026-01-01'),
  maturityDate: '2027-12-31',
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleInvestmentRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created investment', async () => {
      mockInsertChain(sampleInvestment);

      const result = await repository.create({
        id: sampleInvestment.id,
        name: sampleInvestment.name,
        institution: sampleInvestment.institution,
        type: sampleInvestment.type,
        balanceCents: sampleInvestment.balanceCents,
        yieldRateBasisPoints: sampleInvestment.yieldRateBasisPoints,
        maturityDate: sampleInvestment.maturityDate,
        organizationId: sampleInvestment.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleInvestment);
    });
  });

  describe('findById', () => {
    it('should return investment when found', async () => {
      mockSelectChain([sampleInvestment]);

      const result = await repository.findById(sampleInvestment.id, sampleInvestment.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleInvestment);
    });

    it('should return null when investment not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return investments for organization', async () => {
      mockSelectChain([sampleInvestment]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleInvestment]);
    });

    it('should filter by active status by default', async () => {
      mockSelectChain([sampleInvestment]);

      await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleInvestment]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update fields and return updated investment', async () => {
      const updated = { ...sampleInvestment, name: 'CDB Banco Y' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleInvestment.id, sampleInvestment.organizationId, {
        name: 'CDB Banco Y',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should include lastBalanceUpdate when balanceCents is updated', async () => {
      const updated = { ...sampleInvestment, balanceCents: 2000000 };
      const returning = vi.fn().mockResolvedValue([updated]);
      const where = vi.fn().mockReturnValue({ returning });
      const set = vi.fn().mockReturnValue({ where });
      mockDb.update.mockReturnValue({ set });

      await repository.update(sampleInvestment.id, sampleInvestment.organizationId, {
        balanceCents: 2000000,
      });

      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          balanceCents: 2000000,
          lastBalanceUpdate: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should NOT include lastBalanceUpdate when balanceCents is not updated', async () => {
      const updated = { ...sampleInvestment, name: 'Novo Nome' };
      const returning = vi.fn().mockResolvedValue([updated]);
      const where = vi.fn().mockReturnValue({ returning });
      const set = vi.fn().mockReturnValue({ where });
      mockDb.update.mockReturnValue({ set });

      await repository.update(sampleInvestment.id, sampleInvestment.organizationId, {
        name: 'Novo Nome',
      });

      const setArg = set.mock.calls[0][0];
      expect(setArg).not.toHaveProperty('lastBalanceUpdate');
      expect(setArg).toHaveProperty('updatedAt');
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated investment', async () => {
      const archived = { ...sampleInvestment, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleInvestment.id,
        sampleInvestment.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
