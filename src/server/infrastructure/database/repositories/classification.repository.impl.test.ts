import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleClassificationRepository } from './classification.repository.impl';

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

const repository = new DrizzleClassificationRepository();

const sampleClassification = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Essenciais',
  displayOrder: 1,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleClassificationRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created classification', async () => {
      mockInsertChain(sampleClassification);

      const result = await repository.create({
        id: sampleClassification.id,
        name: sampleClassification.name,
        displayOrder: sampleClassification.displayOrder,
        organizationId: sampleClassification.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleClassification);
    });
  });

  describe('findById', () => {
    it('should return classification when found', async () => {
      mockSelectChain([sampleClassification]);

      const result = await repository.findById(sampleClassification.id, sampleClassification.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleClassification);
    });

    it('should return null when classification not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return classifications for organization', async () => {
      mockSelectChain([sampleClassification]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleClassification]);
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleClassification]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('countByOrganization', () => {
    it('should return count of classifications', async () => {
      mockSelectChain([{ count: 7 }]);

      const result = await repository.countByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBe(7);
    });

    it('should return 0 when no classifications exist', async () => {
      mockSelectChain([{ count: 0 }]);

      const result = await repository.countByOrganization('org-123');

      expect(result).toBe(0);
    });
  });

  describe('update', () => {
    it('should update fields and return updated classification', async () => {
      const updated = { ...sampleClassification, name: 'Novo Nome' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleClassification.id, sampleClassification.organizationId, {
        name: 'Novo Nome',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated classification', async () => {
      const archived = { ...sampleClassification, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleClassification.id,
        sampleClassification.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
