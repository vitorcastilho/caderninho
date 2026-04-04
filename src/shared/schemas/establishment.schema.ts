import { z } from 'zod';

import { idSchema } from './common.schema';

export const createEstablishmentSchema = z.object({
  name: z.string().min(1, 'Nome do estabelecimento é obrigatório').max(100),
  emoji: z.string().max(10).optional(),
  subcategoryId: idSchema,
});

export const updateEstablishmentSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    emoji: z.string().max(10).optional(),
    subcategoryId: idSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const establishmentIdSchema = idSchema;

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
