import { z } from 'zod';

import { idSchema, positiveAmountCentsSchema } from './common.schema';

export const createTransactionSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  categoryId: idSchema,
  subcategoryId: idSchema.optional(),
  establishment: z.string().max(200).optional(),
  paymentMethodType: z.enum(['debit', 'credit', 'pix']),
  paymentMethodId: idSchema.optional(),
  description: z.string().max(500).optional(),
  transactionDate: z.coerce.date().optional(),
});

export const transactionIdSchema = idSchema;

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
