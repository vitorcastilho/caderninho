import { z } from 'zod';

import { idSchema, positiveAmountCentsSchema } from './common.schema';

export const createTransactionSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  categoryId: idSchema,
  subcategoryId: idSchema.optional(),
  establishment: z.string().max(200).optional(),
  paymentMethodType: z.enum(['debit', 'credit', 'pix']),
  paymentMethodId: idSchema.optional(),
  installments: z.number().int().nonnegative().optional(),
  description: z.string().max(500).optional(),
  transactionDate: z.coerce.date().optional(),
});

export const transactionIdSchema = idSchema;

export const getImpactPreviewSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  paymentMethodType: z.enum(['debit', 'credit', 'pix']),
  paymentMethodId: idSchema.optional(),
  categoryId: idSchema,
  categoryName: z.string().min(1).max(200),
  categoryBudgetCents: z.number().int().nonnegative(),
  paymentMethodLabel: z.string().min(1).max(200),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type GetImpactPreviewInput = z.infer<typeof getImpactPreviewSchema>;
