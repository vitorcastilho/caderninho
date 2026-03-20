import { createIncomeSourceSchema, updateIncomeSourceSchema } from './income-source.schema';

describe('createIncomeSourceSchema', () => {
  const validPJ = {
    name: 'PJ Consultoria',
    employmentType: 'pj_propria' as const,
    isRecurring: true,
    baseAmountCents: 1500000,
    usualPaymentDay: 5,
  };

  it('should accept valid data for pj_propria', () => {
    const result = createIncomeSourceSchema.safeParse(validPJ);
    expect(result.success).toBe(true);
  });

  it('should accept valid data for clt', () => {
    const result = createIncomeSourceSchema.safeParse({
      name: 'Salário ACME',
      employmentType: 'clt',
      isRecurring: true,
      baseAmountCents: 800000,
      usualPaymentDay: 25,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid data for freelance', () => {
    const result = createIncomeSourceSchema.safeParse({
      name: 'Freelance Design',
      employmentType: 'freelance',
      isRecurring: false,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid data for outro', () => {
    const result = createIncomeSourceSchema.safeParse({
      name: 'Aluguel',
      employmentType: 'outro',
      isRecurring: true,
      baseAmountCents: 200000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createIncomeSourceSchema.safeParse({
      ...validPJ,
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should accept isRecurring true and false', () => {
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, isRecurring: true }).success).toBe(true);
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, isRecurring: false }).success).toBe(true);
  });

  it('should accept positive baseAmountCents', () => {
    const result = createIncomeSourceSchema.safeParse({ ...validPJ, baseAmountCents: 100 });
    expect(result.success).toBe(true);
  });

  it('should reject negative baseAmountCents', () => {
    const result = createIncomeSourceSchema.safeParse({ ...validPJ, baseAmountCents: -100 });
    expect(result.success).toBe(false);
  });

  it('should reject zero baseAmountCents', () => {
    const result = createIncomeSourceSchema.safeParse({ ...validPJ, baseAmountCents: 0 });
    expect(result.success).toBe(false);
  });

  it('should accept usualPaymentDay between 1 and 31', () => {
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, usualPaymentDay: 1 }).success).toBe(true);
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, usualPaymentDay: 31 }).success).toBe(true);
  });

  it('should reject usualPaymentDay 0 and 32', () => {
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, usualPaymentDay: 0 }).success).toBe(false);
    expect(createIncomeSourceSchema.safeParse({ ...validPJ, usualPaymentDay: 32 }).success).toBe(false);
  });

  it('should accept without baseAmountCents and usualPaymentDay (optional)', () => {
    const result = createIncomeSourceSchema.safeParse({
      name: 'Freelance',
      employmentType: 'freelance',
      isRecurring: false,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid employmentType', () => {
    const result = createIncomeSourceSchema.safeParse({
      ...validPJ,
      employmentType: 'invalido',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateIncomeSourceSchema', () => {
  it('should accept partial update with only name', () => {
    const result = updateIncomeSourceSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with only isRecurring', () => {
    const result = updateIncomeSourceSchema.safeParse({ isRecurring: false });
    expect(result.success).toBe(true);
  });

  it('should accept nullable baseAmountCents', () => {
    const result = updateIncomeSourceSchema.safeParse({ baseAmountCents: null });
    expect(result.success).toBe(true);
  });

  it('should accept nullable usualPaymentDay', () => {
    const result = updateIncomeSourceSchema.safeParse({ usualPaymentDay: null });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateIncomeSourceSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
