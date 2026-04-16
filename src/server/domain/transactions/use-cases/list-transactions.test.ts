import { describe, it, expect, vi, beforeEach } from 'vitest';

import { listTransactions, parseSearchAmountCents } from './list-transactions';
import type {
  Transaction,
  TransactionRepository,
} from '../repositories/transaction.repository';

const mockRepository: TransactionRepository = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
  findByOrganization: vi.fn(),
  findByOrganizationFiltered: vi.fn(),
  findTopEstablishments: vi.fn(),
  sumMonthlySpentByCategory: vi.fn(),
  getMonthlySpendingSummary: vi.fn(),
};

const sampleTx: Transaction = {
  id: 'tx-1',
  type: 'expense',
  amountCents: 4250,
  categoryId: 'cat-1',
  subcategoryId: null,
  establishment: 'Pão de Açúcar',
  paymentMethodType: 'debit',
  paymentMethodId: 'bank-a',
  installments: null,
  description: null,
  incomeSourceId: null,
  sourceAccountId: null,
  destinationAccountId: null,
  transactionDate: new Date('2026-04-10T12:00:00Z'),
  referenceMonth: null,
  organizationId: 'org-1',
  createdBy: 'user-1',
  createdAt: new Date('2026-04-10T12:00:00Z'),
  updatedAt: new Date('2026-04-10T12:00:00Z'),
};

describe('parseSearchAmountCents', () => {
  it('retorna null para strings vazias', () => {
    expect(parseSearchAmountCents('')).toBeNull();
    expect(parseSearchAmountCents('   ')).toBeNull();
  });

  it('aceita inteiros simples', () => {
    expect(parseSearchAmountCents('42')).toBe(4200);
  });

  it('aceita vírgula decimal', () => {
    expect(parseSearchAmountCents('42,50')).toBe(4250);
  });

  it('aceita ponto decimal', () => {
    expect(parseSearchAmountCents('42.50')).toBe(4250);
  });

  it('trata ponto como separador de milhar quando há vírgula', () => {
    expect(parseSearchAmountCents('1.234,56')).toBe(123456);
  });

  it('retorna null para strings não numéricas', () => {
    expect(parseSearchAmountCents('mercado')).toBeNull();
    expect(parseSearchAmountCents('42 reais')).toBeNull();
  });

  it('retorna null para números negativos', () => {
    expect(parseSearchAmountCents('-10')).toBeNull();
  });
});

describe('listTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna todas as transações quando sem filtros', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [sampleTx],
      total: 1,
    });

    const result = await listTransactions(
      { repository: mockRepository },
      { organizationId: 'org-1' },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.rows).toHaveLength(1);
    expect(result.data.total).toBe(1);
    expect(result.data.hasMore).toBe(false);
    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: undefined, searchAmountCents: null }),
      { limit: 50, offset: 0 },
    );
  });

  it('aplica cap de 100 no limite', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        pagination: { limit: 500, offset: 0 },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.any(Object),
      { limit: 100, offset: 0 },
    );
  });

  it('normaliza limit <= 0 para 1', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        pagination: { limit: 0, offset: -5 },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.any(Object),
      { limit: 1, offset: 0 },
    );
  });

  it('propaga filtros por tipo e categoria', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: {
          types: ['expense', 'income'],
          categoryIds: ['cat-1', 'cat-2'],
        },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({
        types: ['expense', 'income'],
        categoryIds: ['cat-1', 'cat-2'],
      }),
      expect.any(Object),
    );
  });

  it('propaga filtro por paymentMethodIds', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { paymentMethodIds: ['bank-a', 'cc-1'] },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ paymentMethodIds: ['bank-a', 'cc-1'] }),
      expect.any(Object),
    );
  });

  it('propaga range de datas', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    const dateFrom = new Date('2026-04-01T00:00:00Z');
    const dateTo = new Date('2026-04-30T23:59:59Z');

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { dateFrom, dateTo },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ dateFrom, dateTo }),
      expect.any(Object),
    );
  });

  it('busca textual: descarta search vazio', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '   ' },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: undefined, searchAmountCents: null }),
      expect.any(Object),
    );
  });

  it('busca textual: trim e passagem', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '  mercado  ' },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: 'mercado', searchAmountCents: null }),
      expect.any(Object),
    );
  });

  it('busca numérica: parseia "42,50" para cents', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [],
      total: 0,
    });

    await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        filters: { search: '42,50' },
      },
    );

    expect(mockRepository.findByOrganizationFiltered).toHaveBeenCalledWith(
      'org-1',
      expect.objectContaining({ search: '42,50', searchAmountCents: 4250 }),
      expect.any(Object),
    );
  });

  it('hasMore=true quando offset + rows < total', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: Array.from({ length: 50 }, (_, i) => ({ ...sampleTx, id: `tx-${i}` })),
      total: 120,
    });

    const result = await listTransactions(
      { repository: mockRepository },
      { organizationId: 'org-1' },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.hasMore).toBe(true);
    expect(result.data.total).toBe(120);
  });

  it('hasMore=false quando offset + rows >= total', async () => {
    vi.mocked(mockRepository.findByOrganizationFiltered).mockResolvedValue({
      rows: [sampleTx, sampleTx],
      total: 52,
    });

    const result = await listTransactions(
      { repository: mockRepository },
      {
        organizationId: 'org-1',
        pagination: { limit: 50, offset: 50 },
      },
    );

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.hasMore).toBe(false);
  });
});
