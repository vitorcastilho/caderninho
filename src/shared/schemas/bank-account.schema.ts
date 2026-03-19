import { z } from 'zod';

import { idSchema, amountCentsSchema } from './common.schema';

export const createBankAccountSchema = z.object({
  name: z.string().min(1, 'Nome da conta é obrigatório').max(100),
  bank: z.string().min(1, 'Nome do banco é obrigatório').max(100),
  balanceCents: amountCentsSchema.default(0),
});

export const updateBankAccountSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    bank: z.string().min(1).max(100).optional(),
    balanceCents: amountCentsSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const bankAccountIdSchema = idSchema;

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
