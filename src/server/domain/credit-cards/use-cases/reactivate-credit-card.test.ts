import { vi } from 'vitest';

import { reactivateCreditCard } from './reactivate-credit-card';
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
  status: 'archived' as const,
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('reactivateCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reactivate card and return ok result', async () => {
    const reactivated = { ...sampleCard, status: 'active' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCard);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(reactivated);

    const result = await reactivateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });

  it('should return error when card already active', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...sampleCard, status: 'active' });

    const result = await reactivateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_ALREADY_ACTIVE');
    }
  });

  it('should return error when card not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await reactivateCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_NOT_FOUND');
    }
  });
});
