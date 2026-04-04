import {
  createEstablishmentSchema,
  updateEstablishmentSchema,
  establishmentIdSchema,
} from './establishment.schema';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('createEstablishmentSchema', () => {
  it('should accept valid input with name and subcategoryId', () => {
    const result = createEstablishmentSchema.safeParse({
      name: 'Pão de Açúcar',
      subcategoryId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should accept input with emoji', () => {
    const result = createEstablishmentSchema.safeParse({
      name: 'Pão de Açúcar',
      emoji: '🛒',
      subcategoryId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createEstablishmentSchema.safeParse({
      name: '',
      subcategoryId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing subcategoryId', () => {
    const result = createEstablishmentSchema.safeParse({
      name: 'Pão de Açúcar',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid subcategoryId', () => {
    const result = createEstablishmentSchema.safeParse({
      name: 'Pão de Açúcar',
      subcategoryId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 100 characters', () => {
    const result = createEstablishmentSchema.safeParse({
      name: 'a'.repeat(101),
      subcategoryId: validUUID,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateEstablishmentSchema', () => {
  it('should accept partial update with name only', () => {
    const result = updateEstablishmentSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with emoji only', () => {
    const result = updateEstablishmentSchema.safeParse({ emoji: '🏪' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with subcategoryId only', () => {
    const result = updateEstablishmentSchema.safeParse({ subcategoryId: validUUID });
    expect(result.success).toBe(true);
  });

  it('should accept full update', () => {
    const result = updateEstablishmentSchema.safeParse({
      name: 'Novo Nome',
      emoji: '🏪',
      subcategoryId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateEstablishmentSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject invalid subcategoryId', () => {
    const result = updateEstablishmentSchema.safeParse({ subcategoryId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('establishmentIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = establishmentIdSchema.safeParse(validUUID);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = establishmentIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
