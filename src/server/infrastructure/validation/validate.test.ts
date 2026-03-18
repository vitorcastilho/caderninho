import { z } from 'zod';
import { validateInput } from './validate';

describe('validateInput', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it('deve retornar { success: true, data } para input valido', () => {
    const result = validateInput(testSchema, { name: 'John', age: 30 });

    expect(result).toEqual({
      success: true,
      data: { name: 'John', age: 30 },
    });
  });

  it('deve retornar { success: false, error } para input invalido', () => {
    const result = validateInput(testSchema, { name: '', age: -1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Dados invalidos');
      expect(result.error.details).toBeDefined();
    }
  });

  it('deve incluir campos que falharam nos details', () => {
    const result = validateInput(testSchema, { name: '', age: 'not-a-number' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.details).toBeDefined();
      expect(Object.keys(result.error.details!).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('deve funcionar com schema complexo (nested objects)', () => {
    const nestedSchema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          city: z.string(),
        }),
      }),
    });

    const validResult = validateInput(nestedSchema, {
      user: { name: 'John', address: { city: 'SP' } },
    });
    expect(validResult.success).toBe(true);

    const invalidResult = validateInput(nestedSchema, {
      user: { name: 'John', address: { city: 123 } },
    });
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.details).toBeDefined();
      // path should be "user.address.city"
      expect(invalidResult.error.details!['user.address.city']).toBeDefined();
    }
  });

  it('deve funcionar com schema que tem refinements', () => {
    const refinedSchema = z
      .object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      })
      .refine((d) => d.endDate >= d.startDate, {
        message: 'Data final deve ser posterior',
      });

    const validResult = validateInput(refinedSchema, {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(validResult.success).toBe(true);

    const invalidResult = validateInput(refinedSchema, {
      startDate: '2026-12-31',
      endDate: '2026-01-01',
    });
    expect(invalidResult.success).toBe(false);
    if (!invalidResult.success) {
      expect(invalidResult.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
