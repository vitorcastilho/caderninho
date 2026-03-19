import { vi } from 'vitest';

import { listCreditCards } from './list-credit-cards';
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

describe('listCreditCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list cards and return ok result', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([sampleCard]);

    const result = await listCreditCards(mockRepository, { organizationId: 'org-123' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Latam Pass Visa');
    }
  });

  it('should pass includeArchived to repository', async () => {
    vi.mocked(mockRepository.findAllByOrganization).mockResolvedValue([]);

    await listCreditCards(mockRepository, { organizationId: 'org-123', includeArchived: true });

    expect(mockRepository.findAllByOrganization).toHaveBeenCalledWith('org-123', true);
  });
});
