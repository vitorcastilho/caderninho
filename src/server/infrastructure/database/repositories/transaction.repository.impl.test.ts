import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/server/infrastructure/database/client', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from '@/server/infrastructure/database/client';
import { and } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

import {
  DrizzleTransactionRepository,
  buildFilterConditions,
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

describe('buildFilterConditions (WHERE compartilhado por lista e summary)', () => {
  const dialect = new PgDialect();
  const render = (filters: Parameters<typeof buildFilterConditions>[1]) => {
    const conditions = buildFilterConditions('org-1', filters);
    const query = dialect.sqlToQuery(and(...conditions)!);
    return { count: conditions.length, sql: query.sql, params: query.params };
  };

  it('sem filtros: só o recorte por organização', () => {
    const r = render({});
    expect(r.count).toBe(1);
    expect(r.sql).toContain('"organization_id" = $1');
    expect(r.params).toEqual(['org-1']);
  });

  it('arrays vazios não geram condição', () => {
    expect(render({ types: [], categoryIds: [], paymentMethodIds: [] }).count).toBe(1);
  });

  it('tipos viram IN sobre a coluna type', () => {
    const r = render({ types: ['expense', 'income'] });
    expect(r.sql).toMatch(/"type" in \(\$2, \$3\)/);
    expect(r.params).toEqual(['org-1', 'expense', 'income']);
  });

  it('categorias viram IN sobre category_id', () => {
    const r = render({ categoryIds: ['cat-1'] });
    expect(r.sql).toMatch(/"category_id" in \(\$2\)/);
    expect(r.params).toContain('cat-1');
  });

  it('método de pagamento casa paymentMethodId OU conta de origem OU destino', () => {
    const r = render({ paymentMethodIds: ['bank-1'] });
    expect(r.sql).toMatch(/"payment_method_id" in .* or .*"source_account_id" in .* or .*"destination_account_id" in/);
    expect(r.params.filter((p) => p === 'bank-1')).toHaveLength(3);
  });

  it('período vira >= dateFrom e <= dateTo em transaction_date', () => {
    const dateFrom = new Date('2026-11-01T03:00:00Z');
    const dateTo = new Date('2026-12-01T02:59:59.999Z');
    const r = render({ dateFrom, dateTo });
    expect(r.sql).toMatch(/"transaction_date" >= \$2/);
    expect(r.sql).toMatch(/"transaction_date" <= \$3/);
    expect(r.count).toBe(3);
  });

  it('busca textual faz ILIKE em establishment/description com wildcards escapados', () => {
    const r = render({ search: '100%', searchAmountCents: null });
    expect(r.sql).toMatch(/"establishment" ilike \$2 or .*"description" ilike \$3/);
    expect(r.params).toContain('%100\\%%');
    expect(r.sql).not.toContain('"amount_cents" =');
  });

  it('busca numérica acrescenta igualdade em amount_cents', () => {
    const r = render({ search: '42,50', searchAmountCents: 4250 });
    expect(r.sql).toMatch(/"amount_cents" = \$4/);
    expect(r.params).toContain(4250);
  });

  it('filtros combinados geram uma condição por filtro (AND)', () => {
    const r = render({
      types: ['expense'],
      categoryIds: ['cat-1'],
      paymentMethodIds: ['bank-1'],
      dateFrom: new Date('2026-11-01T03:00:00Z'),
      search: 'merc',
    });
    expect(r.count).toBe(6);
  });
});
