import { vi } from 'vitest';

import { archiveCreditCard } from './archive-credit-card';
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

describe('archiveCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should archive card and return ok result', async () => {
    const archived = { ...sampleCard, status: 'archived' as const };
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCard);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(archived);

    const result = await archiveCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('archived');
    }
  });

  it('should return error when card already archived', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({ ...sampleCard, status: 'archived' });

    const result = await archiveCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'card-1', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_ALREADY_ARCHIVED');
    }
  });

  it('should return error when card not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await archiveCreditCard(
      { repository: mockRepository, auditLogger: mockAuditLogger },
      { id: 'nonexistent', organizationId: 'org-123', userId: 'user-1' },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_NOT_FOUND');
    }
  });
});
