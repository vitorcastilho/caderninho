import { vi, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { DrizzleBankAccountRepository } from './bank-account.repository.impl';

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

const repository = new DrizzleBankAccountRepository();

const sampleAccount = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Conta Corrente',
  bank: 'Nubank',
  balanceCents: 14999,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

describe('DrizzleBankAccountRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should insert and return the created account', async () => {
      mockInsertChain(sampleAccount);

      const result = await repository.create({
        id: sampleAccount.id,
        name: sampleAccount.name,
        bank: sampleAccount.bank,
        balanceCents: sampleAccount.balanceCents,
        organizationId: sampleAccount.organizationId,
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(sampleAccount);
    });
  });

  describe('findById', () => {
    it('should return account when found', async () => {
      mockSelectChain([sampleAccount]);

      const result = await repository.findById(sampleAccount.id, sampleAccount.organizationId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual(sampleAccount);
    });

    it('should return null when account not found', async () => {
      mockSelectChain([]);

      const result = await repository.findById('nonexistent', 'org-123');

      expect(result).toBeNull();
    });
  });

  describe('findAllByOrganization', () => {
    it('should return accounts for organization', async () => {
      mockSelectChain([sampleAccount]);

      const result = await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toEqual([sampleAccount]);
    });

    it('should filter by active status by default', async () => {
      mockSelectChain([sampleAccount]);

      await repository.findAllByOrganization('org-123');

      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should include archived when requested', async () => {
      mockSelectChain([sampleAccount]);

      await repository.findAllByOrganization('org-123', true);

      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update fields and return updated account', async () => {
      const updated = { ...sampleAccount, name: 'Nova Conta' };
      mockUpdateChain(updated);

      const result = await repository.update(sampleAccount.id, sampleAccount.organizationId, {
        name: 'Nova Conta',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated account', async () => {
      const archived = { ...sampleAccount, status: 'archived' as const };
      mockUpdateChain(archived);

      const result = await repository.updateStatus(
        sampleAccount.id,
        sampleAccount.organizationId,
        'archived',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(result).toEqual(archived);
    });
  });
});
