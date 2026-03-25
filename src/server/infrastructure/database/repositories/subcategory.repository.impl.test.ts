import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleSubcategoryRepository } from './subcategory.repository.impl';

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

const repository = new DrizzleSubcategoryRepository();

const sampleSubcategory = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Aluguel',
  categoryId: '550e8400-e29b-41d4-a716-446655440001',
  status: 'active' as const,
  organizationId: 'org-123',
  defaultPaymentMethodType: null,
  defaultPaymentMethodId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleSubcategoryRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created subcategory', async () => {
      mockInsertChain(sampleSubcategory);

      const result = await repository.create({
        id: sampleSubcategory.id,
        name: sampleSubcategory.name,
        categoryId: sampleSubcategory.categoryId,
        defaultPaymentMethodType: null,
        defaultPaymentMethodId: null,
        organizationId: sampleSubcategory.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleSubcategory);
    });
  });

  describe('findById', () => {
    it('should return subcategory when found', async () => {
      mockSelectChain([sampleSubcategory]);

      const result = await repository.findById(sampleSubcategory.id, sampleSubcategory.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleSubcategory);
    });

    it('should return null when subcategory not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return subcategories for organization', async () => {
      mockSelectChain([sampleSubcategory]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleSubcategory]);
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleSubcategory]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('findByCategory', () => {
    it('should return subcategories for a category', async () => {
      mockSelectChain([sampleSubcategory]);

      const result = await repository.findByCategory(sampleSubcategory.categoryId, 'org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleSubcategory]);
    });
  });

  describe('countActiveByCategory', () => {
    it('should return count of active subcategories', async () => {
      mockSelectChain([{ count: 2 }]);

      const result = await repository.countActiveByCategory(sampleSubcategory.categoryId, 'org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBe(2);
    });
  });

  describe('update', () => {
    it('should update fields and return updated subcategory', async () => {
      const updated = { ...sampleSubcategory, name: 'Novo Nome' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleSubcategory.id, sampleSubcategory.organizationId, {
        name: 'Novo Nome',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated subcategory', async () => {
      const archived = { ...sampleSubcategory, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleSubcategory.id,
        sampleSubcategory.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
