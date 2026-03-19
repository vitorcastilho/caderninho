import { vi } from 'vitest';

import { getCreditCard } from './get-credit-card';
import type { CreditCardRepository } from '../repositories/credit-card.repository';

const mockRepository: CreditCardRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAllByOrganization: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

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

describe('getCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return card when found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(sampleCard);

    const result = await getCreditCard(mockRepository, { id: 'card-1', organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Latam Pass Visa');
    }
  });

  it('should return error when card not found', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    const result = await getCreditCard(mockRepository, { id: 'nonexistent', organizationId: 'org-123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CREDIT_CARD_NOT_FOUND');
    }
  });
});
