import {
  createCreditCardSchema,
  updateCreditCardSchema,
  creditCardIdSchema,
} from './credit-card.schema';

describe('createCreditCardSchema', () => {
  it('should accept valid data', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass Visa',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createCreditCardSchema.safeParse({
      name: '',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty brand', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: '',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject zero limit', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 0,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative limit', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: -100,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject closingDay less than 1', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 0,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject closingDay greater than 31', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 32,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });

  it('should reject dueDay less than 1', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject dueDay greater than 31', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 1000000,
      closingDay: 10,
      dueDay: 32,
    });
    expect(result.success).toBe(false);
  });

  it('should reject decimal limitCents', () => {
    const result = createCreditCardSchema.safeParse({
      name: 'Latam Pass',
      brand: 'Visa',
      limitCents: 999.99,
      closingDay: 10,
      dueDay: 17,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCreditCardSchema', () => {
  it('should accept partial fields (name only)', () => {
    const result = updateCreditCardSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (brand only)', () => {
    const result = updateCreditCardSchema.safeParse({ brand: 'Mastercard' });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (limitCents only)', () => {
    const result = updateCreditCardSchema.safeParse({ limitCents: 2000000 });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (closingDay only)', () => {
    const result = updateCreditCardSchema.safeParse({ closingDay: 15 });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (dueDay only)', () => {
    const result = updateCreditCardSchema.safeParse({ dueDay: 25 });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateCreditCardSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should validate name when provided', () => {
    const result = updateCreditCardSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should validate brand when provided', () => {
    const result = updateCreditCardSchema.safeParse({ brand: '' });
    expect(result.success).toBe(false);
  });

  it('should validate limitCents when provided', () => {
    const result = updateCreditCardSchema.safeParse({ limitCents: -1 });
    expect(result.success).toBe(false);
  });

  it('should validate closingDay when provided', () => {
    const result = updateCreditCardSchema.safeParse({ closingDay: 32 });
    expect(result.success).toBe(false);
  });

  it('should validate dueDay when provided', () => {
    const result = updateCreditCardSchema.safeParse({ dueDay: 0 });
    expect(result.success).toBe(false);
  });
});

describe('creditCardIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = creditCardIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = creditCardIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
