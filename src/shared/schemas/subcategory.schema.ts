import { z } from 'zod';

import { idSchema } from './common.schema';

export const createSubcategorySchema = z.object({
  name: z.string().min(1, 'Nome da subcategoria é obrigatório').max(100),
  categoryId: idSchema,
});

export const updateSubcategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const subcategoryIdSchema = idSchema;

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
