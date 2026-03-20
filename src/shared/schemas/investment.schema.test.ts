import { createInvestmentSchema, updateInvestmentSchema } from './investment.schema';

describe('createInvestmentSchema', () => {
  const validRendaFixa = {
    name: 'CDB Banco X',
    institution: 'Banco X',
    type: 'renda_fixa' as const,
    balanceCents: 1000000,
    yieldRateBasisPoints: 11000,
    maturityDate: '2027-12-31',
  };

  const validRendaVariavel = {
    name: 'Ações PETR4',
    institution: 'Corretora Y',
    type: 'renda_variavel' as const,
    balanceCents: 500000,
  };

  const validReserva = {
    name: 'Reserva de Emergência',
    institution: 'Nubank',
    type: 'reserva' as const,
    balanceCents: 2000000,
    yieldRateBasisPoints: 10000,
  };

  it('should accept valid renda_fixa with yieldRateBasisPoints and maturityDate', () => {
    const result = createInvestmentSchema.safeParse(validRendaFixa);
    expect(result.success).toBe(true);
  });

  it('should accept valid renda_variavel without yieldRateBasisPoints', () => {
    const result = createInvestmentSchema.safeParse(validRendaVariavel);
    expect(result.success).toBe(true);
  });

  it('should accept valid reserva with yieldRateBasisPoints', () => {
    const result = createInvestmentSchema.safeParse(validReserva);
    expect(result.success).toBe(true);
  });

  it('should reject renda_fixa without yieldRateBasisPoints (cross-field validation)', () => {
    const result = createInvestmentSchema.safeParse({
      name: 'CDB',
      institution: 'Banco X',
      type: 'renda_fixa',
      balanceCents: 1000000,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const yieldError = result.error.issues.find(
        (i) => i.path.includes('yieldRateBasisPoints'),
      );
      expect(yieldError).toBeDefined();
    }
  });

  it('should reject reserva without yieldRateBasisPoints (cross-field validation)', () => {
    const result = createInvestmentSchema.safeParse({
      name: 'Reserva',
      institution: 'Nubank',
      type: 'reserva',
      balanceCents: 500000,
    });
    expect(result.success).toBe(false);
  });

  it('should accept renda_variavel without yieldRateBasisPoints', () => {
    const result = createInvestmentSchema.safeParse({
      name: 'FII',
      institution: 'Corretora Z',
      type: 'renda_variavel',
      balanceCents: 300000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createInvestmentSchema.safeParse({
      ...validRendaVariavel,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty institution', () => {
    const result = createInvestmentSchema.safeParse({
      ...validRendaVariavel,
      institution: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative balanceCents', () => {
    const result = createInvestmentSchema.safeParse({
      ...validRendaVariavel,
      balanceCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should accept balanceCents of 0 (new investment)', () => {
    const result = createInvestmentSchema.safeParse({
      ...validRendaVariavel,
      balanceCents: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should accept without maturityDate (optional)', () => {
    const result = createInvestmentSchema.safeParse({
      name: 'CDB',
      institution: 'Banco X',
      type: 'renda_fixa',
      balanceCents: 1000000,
      yieldRateBasisPoints: 11000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid type', () => {
    const result = createInvestmentSchema.safeParse({
      ...validRendaVariavel,
      type: 'invalid_type',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateInvestmentSchema', () => {
  it('should accept partial update with only name', () => {
    const result = updateInvestmentSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with only balanceCents', () => {
    const result = updateInvestmentSchema.safeParse({ balanceCents: 2000000 });
    expect(result.success).toBe(true);
  });

  it('should accept nullable yieldRateBasisPoints (for type change to renda_variavel)', () => {
    const result = updateInvestmentSchema.safeParse({
      yieldRateBasisPoints: null,
    });
    expect(result.success).toBe(true);
  });

  it('should accept nullable maturityDate', () => {
    const result = updateInvestmentSchema.safeParse({
      maturityDate: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateInvestmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
