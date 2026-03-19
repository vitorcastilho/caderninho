import { vi } from 'vitest';

import { updateCreditCard } from './update-credit-card';
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
  id: 'card-1',
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

describe('updateCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update card and return ok result', async () => {
    const updated = { ...sampleCard, name: 'Novo Cartão' };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCard);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    const result = await updateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo Cartão' } },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Novo Cartão');
    }
  });

  it('should return error when card not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await updateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1', data: { name: 'Novo' } },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_NOT_FOUND');
    }
  });

  it('should register audit with oldValue and newValue', async () => {
    const updated = { ...sampleCard, limitCents: 2000000 };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCard);
    vi.mocked(mockRepository.update).mockResolvedValue(updated);

    await updateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1', data: { limitCents: 2000000 } },
    );

    expect(mockAuditLogger).toHaveBeenCalledWith({
      userId: 'user-1',
      organizationId: 'org-123',
      action: 'UPDATE',
      entityType: 'credit_card',
      entityId: 'card-1',
      oldValue: { name: 'Latam Pass Visa', brand: 'Visa', limitCents: 1000000, closingDay: 10, dueDay: 17 },
      newValue: { name: 'Latam Pass Visa', brand: 'Visa', limitCents: 2000000, closingDay: 10, dueDay: 17 },
    });
  });
});
