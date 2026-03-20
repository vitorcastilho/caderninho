import {
  createSubcategorySchema,
  updateSubcategorySchema,
  subcategoryIdSchema,
} from './subcategory.schema';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('createSubcategorySchema', () => {
  it('should accept valid input', () => {
    const result = createSubcategorySchema.safeParse({
      name: 'Aluguel',
      categoryId: validUUID,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createSubcategorySchema.safeParse({
      name: '',
      categoryId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 100 chars', () => {
    const result = createSubcategorySchema.safeParse({
      name: 'a'.repeat(101),
      categoryId: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid categoryId', () => {
    const result = createSubcategorySchema.safeParse({
      name: 'Aluguel',
      categoryId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateSubcategorySchema', () => {
  it('should accept partial update with name', () => {
    const result = updateSubcategorySchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateSubcategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = updateSubcategorySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('subcategoryIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = subcategoryIdSchema.safeParse(validUUID);
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = subcategoryIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
