import {
  createClassificationSchema,
  updateClassificationSchema,
  mergeClassificationsSchema,
  classificationIdSchema,
} from './essentiality-classification.schema';

describe('createClassificationSchema', () => {
  it('should accept valid input', () => {
    const result = createClassificationSchema.safeParse({
      name: 'Essenciais',
      displayOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = createClassificationSchema.safeParse({
      name: '',
      displayOrder: 1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject name longer than 100 chars', () => {
    const result = createClassificationSchema.safeParse({
      name: 'a'.repeat(101),
      displayOrder: 1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative displayOrder', () => {
    const result = createClassificationSchema.safeParse({
      name: 'Test',
      displayOrder: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer displayOrder', () => {
    const result = createClassificationSchema.safeParse({
      name: 'Test',
      displayOrder: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('should accept displayOrder 0', () => {
    const result = createClassificationSchema.safeParse({
      name: 'Test',
      displayOrder: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe('updateClassificationSchema', () => {
  it('should accept partial update with name only', () => {
    const result = updateClassificationSchema.safeParse({ name: 'Novo Nome' });
    expect(result.success).toBe(true);
  });

  it('should accept partial update with displayOrder only', () => {
    const result = updateClassificationSchema.safeParse({ displayOrder: 5 });
    expect(result.success).toBe(true);
  });

  it('should accept full update', () => {
    const result = updateClassificationSchema.safeParse({
      name: 'Novo Nome',
      displayOrder: 5,
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty object', () => {
    const result = updateClassificationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const result = updateClassificationSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});

describe('mergeClassificationsSchema', () => {
  it('should accept valid UUIDs', () => {
    const result = mergeClassificationsSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid sourceId', () => {
    const result = mergeClassificationsSchema.safeParse({
      sourceId: 'not-a-uuid',
      targetId: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid targetId', () => {
    const result = mergeClassificationsSchema.safeParse({
      sourceId: '550e8400-e29b-41d4-a716-446655440000',
      targetId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('classificationIdSchema', () => {
  it('should accept valid UUID', () => {
    const result = classificationIdSchema.safeParse('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(true);
  });

  it('should reject invalid UUID', () => {
    const result = classificationIdSchema.safeParse('not-a-uuid');
    expect(result.success).toBe(false);
  });
});
