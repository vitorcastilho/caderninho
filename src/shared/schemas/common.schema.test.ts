import {
  idSchema,
  amountCentsSchema,
  positiveAmountCentsSchema,
  percentBasisPointsSchema,
  paginationSchema,
  dateRangeSchema,
  sortSchema,
} from './common.schema';

describe('idSchema', () => {
  it('deve aceitar UUID valido', () => {
    const result = idSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('deve rejeitar string invalida', () => {
    const result = idSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});

describe('amountCentsSchema', () => {
  it('deve aceitar 0', () => {
    const result = amountCentsSchema.safeParse(0);
    expect(result.success).toBe(true);
  });

  it('deve aceitar inteiros positivos', () => {
    const result = amountCentsSchema.safeParse(15000);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar numeros negativos', () => {
    const result = amountCentsSchema.safeParse(-100);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar numeros decimais', () => {
    const result = amountCentsSchema.safeParse(10.5);
    expect(result.success).toBe(false);
  });
});

describe('positiveAmountCentsSchema', () => {
  it('deve aceitar inteiros positivos', () => {
    const result = positiveAmountCentsSchema.safeParse(1);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar 0', () => {
    const result = positiveAmountCentsSchema.safeParse(0);
    expect(result.success).toBe(false);
  });
});

describe('percentBasisPointsSchema', () => {
  it('deve aceitar 0 (0%)', () => {
    const result = percentBasisPointsSchema.safeParse(0);
    expect(result.success).toBe(true);
  });

  it('deve aceitar 10000 (100%)', () => {
    const result = percentBasisPointsSchema.safeParse(10000);
    expect(result.success).toBe(true);
  });

  it('deve aceitar valor intermediario (5000 = 50%)', () => {
    const result = percentBasisPointsSchema.safeParse(5000);
    expect(result.success).toBe(true);
  });

  it('deve rejeitar valor acima de 10000', () => {
    const result = percentBasisPointsSchema.safeParse(10001);
    expect(result.success).toBe(false);
  });

  it('deve rejeitar valor negativo', () => {
    const result = percentBasisPointsSchema.safeParse(-1);
    expect(result.success).toBe(false);
  });
});

describe('paginationSchema', () => {
  it('deve aplicar defaults (page=1, pageSize=20)', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('deve aceitar valores customizados', () => {
    const result = paginationSchema.safeParse({ page: 3, pageSize: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it('deve rejeitar page <= 0', () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('deve rejeitar pageSize > 100', () => {
    const result = paginationSchema.safeParse({ pageSize: 101 });
    expect(result.success).toBe(false);
  });
});

describe('dateRangeSchema', () => {
  it('deve aceitar range valido (endDate >= startDate)', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(result.success).toBe(true);
  });

  it('deve aceitar range com mesma data', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2026-01-15',
      endDate: '2026-01-15',
    });
    expect(result.success).toBe(true);
  });

  it('deve rejeitar quando endDate < startDate', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2026-01-31',
      endDate: '2026-01-01',
    });
    expect(result.success).toBe(false);
  });
});

describe('sortSchema', () => {
  it('deve aplicar default direction "desc"', () => {
    const result = sortSchema.safeParse({ field: 'createdAt' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBe('desc');
    }
  });

  it('deve aceitar direction "asc"', () => {
    const result = sortSchema.safeParse({ field: 'amount', direction: 'asc' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.direction).toBe('asc');
    }
  });

  it('deve rejeitar direction invalida', () => {
    const result = sortSchema.safeParse({ field: 'name', direction: 'up' });
    expect(result.success).toBe(false);
  });
});
