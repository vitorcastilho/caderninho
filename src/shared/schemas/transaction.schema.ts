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

export const createIncomeSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  incomeSourceId: idSchema,
  destinationAccountId: idSchema,
  description: z.string().max(500).optional(),
  transactionDate: z.coerce.date().optional(),
});

export const createTransferSchema = z
  .object({
    amountCents: positiveAmountCentsSchema,
    sourceAccountId: idSchema,
    destinationAccountId: idSchema,
    description: z.string().max(500).optional(),
    transactionDate: z.coerce.date().optional(),
  })
  .refine((d) => d.sourceAccountId !== d.destinationAccountId, {
    message: 'Conta de origem e destino devem ser diferentes',
    path: ['destinationAccountId'],
  });

export const updateExpenseSchema = z
  .object({
    id: idSchema,
    amountCents: positiveAmountCentsSchema.optional(),
    categoryId: idSchema.optional(),
    subcategoryId: idSchema.optional(),
    establishment: z.string().max(200).optional(),
    paymentMethodType: z.enum(['debit', 'credit', 'pix']).optional(),
    paymentMethodId: idSchema.optional(),
    installments: z.number().int().nonnegative().optional(),
    description: z.string().max(500).optional(),
    transactionDate: z.coerce.date().optional(),
  })
  .refine(
    (d) =>
      Object.entries(d).some(([key, value]) => key !== 'id' && value !== undefined),
    { message: 'Informe ao menos um campo para atualizar' },
  );

export const deleteTransactionSchema = z.object({
  id: idSchema,
});

export const recreateTransactionSnapshotSchema = z.object({
  id: idSchema,
  type: z.enum(['expense', 'income', 'transfer']),
  amountCents: positiveAmountCentsSchema,
  categoryId: idSchema.nullable(),
  subcategoryId: idSchema.nullable(),
  establishment: z.string().max(200).nullable(),
  paymentMethodType: z.enum(['debit', 'credit', 'pix']).nullable(),
  paymentMethodId: idSchema.nullable(),
  installments: z.number().int().nonnegative().nullable(),
  description: z.string().max(500).nullable(),
  incomeSourceId: idSchema.nullable(),
  sourceAccountId: idSchema.nullable(),
  destinationAccountId: idSchema.nullable(),
  transactionDate: z.coerce.date(),
  referenceMonth: z.string().max(10).nullable(),
});

export const transactionIdSchema = idSchema;

export const listTransactionsFilterSchema = z.object({
  types: z.array(z.enum(['expense', 'income', 'transfer'])).optional(),
  categoryIds: z.array(idSchema).optional(),
  paymentMethodIds: z.array(idSchema).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().max(200).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type ListTransactionsFilterInput = z.infer<typeof listTransactionsFilterSchema>;

export const getImpactPreviewSchema = z.object({
  amountCents: positiveAmountCentsSchema,
  paymentMethodType: z.enum(['debit', 'credit', 'pix']),
  paymentMethodId: idSchema.optional(),
  categoryId: idSchema,
  categoryName: z.string().min(1).max(200),
  categoryBudgetCents: z.number().int().nonnegative(),
  paymentMethodLabel: z.string().min(1).max(200),
});

export const getMonthlySpendingSummarySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;
export type RecreateTransactionSnapshotInput = z.infer<typeof recreateTransactionSnapshotSchema>;
export type GetImpactPreviewInput = z.infer<typeof getImpactPreviewSchema>;
export type GetMonthlySpendingSummaryInput = z.infer<typeof getMonthlySpendingSummarySchema>;
