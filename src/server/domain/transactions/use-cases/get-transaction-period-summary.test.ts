import { describe, it, expect, vi, beforeEach } from 'vitest';

import { getTransactionPeriodSummary } from './get-transaction-period-summary';
import type { TransactionRepository } from '../repositories/transaction.repository';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findByOrganizationFiltered: vi.fn(),
  aggregateByTypeForOrganizationFiltered: vi.fn(),
  findTopEstablishments: vi.fn(),
  sumMonthlySpentByCategory: vi.fn(),
  getMonthlySpendingSummary: vi.fn(),
};

describe('getTransactionPeriodSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna zeros para os 3 tipos quando o repository retorna vazio', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([]);

    const result = await getTransactionPeriodSummary(
      { repository: mockRepository },
      { organizationId: 'org-1' },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      expense: { totalCents: 0, count: 0 },
      income: { totalCents: 0, count: 0 },
      transfer: { totalCents: 0, count: 0 },
    });
  });

  it('mapeia totalCents e count por tipo', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([
      { type: 'expense', totalCents: 12500, count: 4 },
      { type: 'income', totalCents: 50000, count: 1 },
      { type: 'transfer', totalCents: 20000, count: 2 },
    ]);

    const result = await getTransactionPeriodSummary(
      { repository: mockRepository },
      { organizationId: 'org-1' },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      expense: { totalCents: 12500, count: 4 },
      income: { totalCents: 50000, count: 1 },
      transfer: { totalCents: 20000, count: 2 },
    });
  });

  it('mantém zeros para tipos ausentes no retorno', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([
      { type: 'income', totalCents: 50000, count: 1 },
    ]);

    const result = await getTransactionPeriodSummary(
      { repository: mockRepository },
      { organizationId: 'org-1' },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.expense).toEqual({ totalCents: 0, count: 0 });
    expect(result.data.transfer).toEqual({ totalCents: 0, count: 0 });
    expect(result.data.income).toEqual({ totalCents: 50000, count: 1 });
  });

  it('propaga filtros tipo/categoria/método/período para o repository', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([]);

    const dateFrom = new Date('2026-04-01');
    const dateTo = new Date('2026-04-30');

    await getTransactionPeriodSummary(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: {
          types: ['expense'],
          categoryIds: ['cat-1', 'cat-2'],
          paymentMethodIds: ['bank-1'],
          dateFrom,
          dateTo,
        },
      },
    );

    expect(mockRepository.aggregateByTypeForOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({
        types: ['expense'],
        categoryIds: ['cat-1', 'cat-2'],
        paymentMethodIds: ['bank-1'],
        dateFrom,
        dateTo,
      }),
    );
  });

  it('descarta search vazio (string só com espaços)', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([]);

    await getTransactionPeriodSummary(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '   ' },
      },
    );

    expect(mockRepository.aggregateByTypeForOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: undefined, searchAmountCents: null }),
    );
  });

  it('parseia search numérico em searchAmountCents (regressão guard com listTransactions)', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([]);

    await getTransactionPeriodSummary(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '42,50' },
      },
    );

    expect(mockRepository.aggregateByTypeForOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: '42,50', searchAmountCents: 4250 }),
    );
  });

  it('trim e propaga search textual', async () => {
    vi.mocked(mockRepository.aggregateByTypeForOrganizationFiltered).mockResolvedValue([]);

    await getTransactionPeriodSummary(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '  mercado  ' },
      },
    );

    expect(mockRepository.aggregateByTypeForOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: 'mercado', searchAmountCents: null }),
    );
  });
});
