import { vi } from 'vitest';

import { createCreditCard } from './create-credit-card';
import type { CreditCardRepository } from '../repositories/credit-card.repository';
import type { AuditLogger } from '@/server/domain/shared/types/audit-logger';

const mockRepository: CreditCardRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockAuditLogger: AuditLogger = vi.fn();

const sampleCard = {
  id: expect.any(String),
  name: 'Latam Pass Visa',
  brand: 'Visa',
  limitCents: 1000000,
  closingDay: 10,
  dueDay: 17,
  status: 'active' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('createCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockRepository.create).mockResolvedValue(sampleCard);
  });

  it('should create card and return ok result', async () => {
    const result = await createCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Latam Pass Visa',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Latam Pass Visa');
    }
    expect(mockRepository.create).toHaveBeenCalledWith({
      id: expect.any(String),
      name: 'Latam Pass Visa',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 17,
      organizationId: 'org-123',
    });
  });

  it('should register audit log on create', async () => {
    await createCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      {
        name: 'Latam Pass Visa',
        brand: 'Visa',
        limitCents: 1000000,
        closingDay: 10,
        dueDay: 17,
        organizationId: 'org-123',
        userId: 'user-1',
      },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'CREATE',
      entityType: 'credit_card',
      entityId: expect.any(String),
      oldValue: null,
      newValue: { name: 'Latam Pass Visa', brand: 'Visa', limitCents: 1000000, closingDay: 10, dueDay: 17 },
    });
  });
});
