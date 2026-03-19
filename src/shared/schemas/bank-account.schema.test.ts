import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdSchema,
} from './bank-account.schema';

describe('createBankAccountSchema', () => {
  it('should accept valid data', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 14999,
    });
    expect(result.success).toBe(true);
  });

  it('should accept valid data without balanceCents (defaults to 0)', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: 'Nubank',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balanceCents).toBe(0);
    }
  });

  it('should accept zero balance', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createBankAccountSchema.safeParse({
      name: '',
      bank: 'Nubank',
      balanceCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty bank', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: '',
      balanceCents: 0,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative balanceCents', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject decimal balanceCents', () => {
    const result = createBankAccountSchema.safeParse({
      name: 'Conta Corrente',
      bank: 'Nubank',
      balanceCents: 149.99,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateBankAccountSchema', () => {
  it('should accept partial fields (name only)', () => {
    const result = updateBankAccountSchema.safeParse({ name: 'Nova Conta' });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (bank only)', () => {
    const result = updateBankAccountSchema.safeParse({ bank: 'Itaú' });
    expect(result.success).toBe(true);
  });

  it('should accept partial fields (balanceCents only)', () => {
    const result = updateBankAccountSchema.safeParse({ balanceCents: 5000 });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateBankAccountSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should validate name when provided', () => {
    const result = updateBankAccountSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should validate bank when provided', () => {
    const result = updateBankAccountSchema.safeParse({ bank: '' });
    expect(result.success).toBe(false);
  });

  it('should validate balanceCents when provided', () => {
    const result = updateBankAccountSchema.safeParse({ balanceCents: -1 });
    expect(result.success).toBe(false);
  });
});

describe('bankAccountIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = bankAccountIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = bankAccountIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
