import {
  createTransactionSchema,
  transactionIdSchema,
} from './transaction.schema';

describe('createTransactionSchema', () => {
  const validData = {
    amountCents: 8700,
    categoryId: '550e8400-e29b-41d4-a716-446655440000',
    paymentMethodType: 'debit' as const,
  };

  it('should accept valid minimal data', () => {
    const result = createTransactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept valid complete data', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      subcategoryId: '550e8400-e29b-41d4-a716-446655440001',
      establishment: 'Pão de Açúcar',
      paymentMethodId: '550e8400-e29b-41d4-a716-446655440002',
      description: 'Compras do mês',
      transactionDate: '2026-04-04T12:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('should accept credit payment type', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      paymentMethodType: 'credit',
    });
    expect(result.success).toBe(true);
  });

  it('should accept pix payment type', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      paymentMethodType: 'pix',
    });
    expect(result.success).toBe(true);
  });

  it('should reject zero amountCents', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      amountCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative amountCents', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      amountCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject decimal amountCents', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      amountCents: 87.5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing categoryId', () => {
    const result = createTransactionSchema.safeParse({
      amountCents: validData.amountCents,
      paymentMethodType: validData.paymentMethodType,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid categoryId', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      categoryId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing paymentMethodType', () => {
    const result = createTransactionSchema.safeParse({
      amountCents: validData.amountCents,
      categoryId: validData.categoryId,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid paymentMethodType', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      paymentMethodType: 'cash',
    });
    expect(result.success).toBe(false);
  });

  it('should reject establishment exceeding 200 chars', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      establishment: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('should reject description exceeding 500 chars', () => {
    const result = createTransactionSchema.safeParse({
      ...validData,
      description: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe('transactionIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = transactionIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = transactionIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
