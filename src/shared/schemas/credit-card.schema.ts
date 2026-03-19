import { z } from 'zod';

import { idSchema } from './common.schema';

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Nome do cartão é obrigatório').max(100),
  brand: z.string().min(1, 'Bandeira é obrigatória').max(50),
  limitCents: z.number().int().positive('Limite deve ser um valor positivo'),
  closingDay: z
    .number()
    .int()
    .min(1, 'Dia de fechamento deve ser entre 1 e 31')
    .max(31, 'Dia de fechamento deve ser entre 1 e 31'),
  dueDay: z
    .number()
    .int()
    .min(1, 'Dia de vencimento deve ser entre 1 e 31')
    .max(31, 'Dia de vencimento deve ser entre 1 e 31'),
});

export const updateCreditCardSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    brand: z.string().min(1).max(50).optional(),
    limitCents: z.number().int().positive().optional(),
    closingDay: z.number().int().min(1).max(31).optional(),
    dueDay: z.number().int().min(1).max(31).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const creditCardIdSchema = idSchema;

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
