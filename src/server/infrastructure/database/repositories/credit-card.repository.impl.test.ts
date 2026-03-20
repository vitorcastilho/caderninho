import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleCreditCardRepository } from './credit-card.repository.impl';

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
  const orderBy = vi.fn().mockResolvedValue(returnValue);
  const where = vi.fn().mockReturnValue(Object.assign(Promise.resolve(returnValue), { orderBy }));
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValue({ from });
}

function mockUpdateChain(returnValue: unknown) {
  const returning = vi.fn().mockResolvedValue([returnValue]);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValue({ set });
}

const repository = new DrizzleCreditCardRepository();

const sampleCard = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Latam Pass Visa',
  brand: 'Visa',
  limitCents: 1000000,
  closingDay: 10,
  dueDay: 17,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleCreditCardRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created card', async () => {
      mockInsertChain(sampleCard);

      const result = await repository.create({
        id: sampleCard.id,
        name: sampleCard.name,
        brand: sampleCard.brand,
        limitCents: sampleCard.limitCents,
        closingDay: sampleCard.closingDay,
        dueDay: sampleCard.dueDay,
        organizationId: sampleCard.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleCard);
    });
  });

  describe('findById', () => {
    it('should return card when found', async () => {
      mockSelectChain([sampleCard]);

      const result = await repository.findById(sampleCard.id, sampleCard.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleCard);
    });

    it('should return null when card not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return cards for organization', async () => {
      mockSelectChain([sampleCard]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleCard]);
    });

    it('should filter by active status by default', async () => {
      mockSelectChain([sampleCard]);

      await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleCard]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update fields and return updated card', async () => {
      const updated = { ...sampleCard, name: 'Novo Cartão' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleCard.id, sampleCard.organizationId, {
        name: 'Novo Cartão',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated card', async () => {
      const archived = { ...sampleCard, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleCard.id,
        sampleCard.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
