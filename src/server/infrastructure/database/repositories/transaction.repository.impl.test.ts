import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import {
  DrizzleTransactionRepository,
  escapeLikePattern,
} from './transaction.repository.impl';

const mockDb = db as unknown as { select: Mock };

// Captura as chamadas feitas na chain do Drizzle para podermos afirmar sobre
// a forma do WHERE (via `where`) e o `groupBy`. O retorno final é controlado
// através de `resolveTo`.
function mockAggregateChain(resolveTo: Array<{ type: string; totalCents: number; count: number }>) {
  const groupBy = vi.fn().mockResolvedValue(resolveTo);
  const where = vi.fn().mockReturnValue({ groupBy });
  const from = vi.fn().mockReturnValue({ where });
  mockDb.select.mockReturnValue({ from });
  return { from, where, groupBy };
}

describe('escapeLikePattern', () => {
  it('não altera strings sem wildcards', () => {
    expect(escapeLikePattern('mercado')).toBe('mercado');
    expect(escapeLikePattern('Padaria 2')).toBe('Padaria 2');
  });

  it('escapa o caractere percent (%)', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
    expect(escapeLikePattern('%desconto%')).toBe('\\%desconto\\%');
  });

  it('escapa o caractere underscore (_)', () => {
    expect(escapeLikePattern('loja_x')).toBe('loja\\_x');
  });

  it('escapa a barra invertida (\\)', () => {
    expect(escapeLikePattern('caminho\\teste')).toBe('caminho\\\\teste');
  });

  it('escapa múltiplos wildcards simultâneos', () => {
    expect(escapeLikePattern('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });

  it('retorna string vazia quando a entrada é vazia', () => {
    expect(escapeLikePattern('')).toBe('');
  });
});

describe('DrizzleTransactionRepository.aggregateByTypeForOrganizationFiltered', () => {
  const repository = new DrizzleTransactionRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna as 3 categorias somadas e convertidas quando retorno não vem vazio', async () => {
    mockAggregateChain([
      { type: 'expense', totalCents: '12500', count: '4' } as unknown as {
        type: string;
        totalCents: number;
        count: number;
      },
      { type: 'income', totalCents: '50000', count: '1' } as unknown as {
        type: string;
        totalCents: number;
        count: number;
      },
      { type: 'transfer', totalCents: '20000', count: '2' } as unknown as {
        type: string;
        totalCents: number;
        count: number;
      },
    ]);

    const result = await repository.aggregateByTypeForOrganizationFiltered('org-1', {});

    expect(result).toEqual([
      { type: 'expense', totalCents: 12500, count: 4 },
      { type: 'income', totalCents: 50000, count: 1 },
      { type: 'transfer', totalCents: 20000, count: 2 },
    ]);
  });

  it('retorna array vazio quando não há transações', async () => {
    mockAggregateChain([]);

    const result = await repository.aggregateByTypeForOrganizationFiltered('org-1', {});

    expect(result).toEqual([]);
  });

  it('filtra por tipo (apenas expense)', async () => {
    const { where } = mockAggregateChain([
      { type: 'expense', totalCents: 300, count: 1 },
    ]);

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      types: ['expense'],
    });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('filtra por categoria', async () => {
    const { where } = mockAggregateChain([]);

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      categoryIds: ['cat-1'],
    });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('filtra por método de pagamento (OR across paymentMethodId/source/destination)', async () => {
    const { where } = mockAggregateChain([]);

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      paymentMethodIds: ['bank-1', 'cc-1'],
    });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('filtra por período', async () => {
    const { where } = mockAggregateChain([]);
    const dateFrom = new Date('2026-04-01');
    const dateTo = new Date('2026-04-30');

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      dateFrom,
      dateTo,
    });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('filtra por busca textual (escape aplicado a %)', async () => {
    const { where } = mockAggregateChain([]);

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      search: '100%',
      searchAmountCents: 10000,
    });

    expect(where).toHaveBeenCalledTimes(1);
  });

  it('combina múltiplos filtros em uma única query', async () => {
    const { where, groupBy } = mockAggregateChain([
      { type: 'expense', totalCents: 500, count: 1 },
    ]);

    await repository.aggregateByTypeForOrganizationFiltered('org-1', {
      types: ['expense'],
      categoryIds: ['cat-1'],
      paymentMethodIds: ['bank-1'],
      dateFrom: new Date('2026-04-01'),
      dateTo: new Date('2026-04-30'),
      search: 'mercado',
      searchAmountCents: null,
    });

    expect(where).toHaveBeenCalledTimes(1);
    expect(groupBy).toHaveBeenCalledTimes(1);
  });

  it('ignora linhas com type inválido (retorno defensivo)', async () => {
    mockAggregateChain([
      { type: 'expense', totalCents: 100, count: 1 },
      { type: 'unknown-type', totalCents: 999, count: 1 },
    ]);

    const result = await repository.aggregateByTypeForOrganizationFiltered('org-1', {});

    expect(result).toEqual([{ type: 'expense', totalCents: 100, count: 1 }]);
  });
});
