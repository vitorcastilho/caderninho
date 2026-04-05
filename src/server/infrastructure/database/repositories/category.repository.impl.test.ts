import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleCategoryRepository } from './category.repository.impl';

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

function mockUpdateBulkChain(returnValue: unknown[]) {
  const returning = vi.fn().mockResolvedValue(returnValue);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  mockDb.update.mockReturnValue({ set });
}

const repository = new DrizzleCategoryRepository();

const sampleCategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Moradia',
  emoji: '📁',
  classificationId: '550e8400-e29b-41d4-a716-446655440001',
  budgetMinCents: 220000,
  budgetMaxCents: null,
  defaultPaymentMethodType: null,
  defaultPaymentMethodId: null,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleCategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created category', async () => {
      mockInsertChain(sampleCategory);

      const result = await repository.create({
        id: sampleCategory.id,
        name: sampleCategory.name,
        classificationId: sampleCategory.classificationId,
        budgetMinCents: sampleCategory.budgetMinCents,
        budgetMaxCents: sampleCategory.budgetMaxCents,
        defaultPaymentMethodType: sampleCategory.defaultPaymentMethodType,
        defaultPaymentMethodId: sampleCategory.defaultPaymentMethodId,
        organizationId: sampleCategory.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleCategory);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      mockSelectChain([sampleCategory]);

      const result = await repository.findById(sampleCategory.id, sampleCategory.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleCategory);
    });

    it('should return null when category not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return categories for organization', async () => {
      mockSelectChain([sampleCategory]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleCategory]);
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleCategory]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('findByClassification', () => {
    it('should return categories for a classification', async () => {
      mockSelectChain([sampleCategory]);

      const result = await repository.findByClassification(sampleCategory.classificationId, 'org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleCategory]);
    });
  });

  describe('countActiveByClassification', () => {
    it('should return count of active categories', async () => {
      mockSelectChain([{ count: 3 }]);

      const result = await repository.countActiveByClassification(sampleCategory.classificationId, 'org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });

  describe('update', () => {
    it('should update fields and return updated category', async () => {
      const updated = { ...sampleCategory, name: 'Nova Categoria' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleCategory.id, sampleCategory.organizationId, {
        name: 'Nova Categoria',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateClassificationBulk', () => {
    it('should update classification for all matching categories', async () => {
      mockUpdateBulkChain([sampleCategory, sampleCategory]);

      const result = await repository.updateClassificationBulk(
        'old-classification-id',
        'new-classification-id',
        'org-123',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated category', async () => {
      const archived = { ...sampleCategory, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleCategory.id,
        sampleCategory.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
