import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from './category.schema';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('createCategorySchema', () => {
  it('should accept valid input without budget', () => {
    const result = createCategorySchema.safeParse({
      name: 'Moradia',
      classificationId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept fixed budget (min only)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Moradia',
      classificationId: validUUID,
      budgetMinCents: 220000,
    });
    expect(result.success).toBe(true);
  });

  it('should accept budget range (min and max)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      budgetMinCents: 250000,
      budgetMaxCents: 300000,
    });
    expect(result.success).toBe(true);
  });

  it('should accept budget range where min equals max', () => {
    const result = createCategorySchema.safeParse({
      name: 'Transporte',
      classificationId: validUUID,
      budgetMinCents: 80000,
      budgetMaxCents: 80000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject max without min', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      classificationId: validUUID,
      budgetMaxCents: 300000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject max less than min', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      classificationId: validUUID,
      budgetMinCents: 300000,
      budgetMaxCents: 200000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = createCategorySchema.safeParse({
      name: '',
      classificationId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid classificationId', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      classificationId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative budget values', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      classificationId: validUUID,
      budgetMinCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should accept null budget values', () => {
    const result = createCategorySchema.safeParse({
      name: 'Test',
      classificationId: validUUID,
      budgetMinCents: null,
      budgetMaxCents: null,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid payment method (credit)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'credit',
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid payment method (debit)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'debit',
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid payment method (pix)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'pix',
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept null payment method (no default)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: null,
      defaultPaymentMethodId: null,
    });
    expect(result.success).toBe(true);
  });

  it('should accept omitted payment method fields', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should reject type without id', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'credit',
    });
    expect(result.success).toBe(false);
  });

  it('should reject id without type', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment method type', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'cash',
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment method id (not UUID)', () => {
    const result = createCategorySchema.safeParse({
      name: 'Alimentação',
      classificationId: validUUID,
      defaultPaymentMethodType: 'credit',
      defaultPaymentMethodId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCategorySchema', () => {
  it('should accept partial update with name only', () => {
    const result = updateCategorySchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with classificationId only', () => {
    const result = updateCategorySchema.safeParse({ classificationId: validUUID });
    expect(result.success).toBe(true);
  });

  it('should accept budget update', () => {
    const result = updateCategorySchema.safeParse({
      budgetMinCents: 100000,
      budgetMaxCents: 200000,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateCategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject max without min in update', () => {
    const result = updateCategorySchema.safeParse({
      budgetMaxCents: 300000,
    });
    expect(result.success).toBe(false);
  });

  it('should accept payment method update (both fields)', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodType: 'pix',
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept clearing payment method (both null)', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodType: null,
      defaultPaymentMethodId: null,
    });
    expect(result.success).toBe(true);
  });

  it('should reject type without id in update', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodType: 'debit',
    });
    expect(result.success).toBe(false);
  });

  it('should reject id without type in update', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject only type as null without id (invariante AC#9)', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodType: null,
    });
    expect(result.success).toBe(false);
  });

  it('should reject only id as null without type (invariante AC#9)', () => {
    const result = updateCategorySchema.safeParse({
      defaultPaymentMethodId: null,
    });
    expect(result.success).toBe(false);
  });

  it('should accept update with name and no payment fields (no change to payment)', () => {
    const result = updateCategorySchema.safeParse({
      name: 'Novo Nome',
    });
    expect(result.success).toBe(true);
  });
});

describe('categoryIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = categoryIdSchema.safeParse(validUUID);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = categoryIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
