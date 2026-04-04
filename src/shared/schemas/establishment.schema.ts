import { z } from 'zod';

import { idSchema } from './common.schema';
import { PAYMENT_METHOD_TYPES } from '@/shared/constants/category.constants';

export const createEstablishmentSchema = z.object({
  name: z.string().min(1, 'Nome do estabelecimento é obrigatório').max(100),
  emoji: z.string().max(10).optional(),
  subcategoryId: idSchema,
  defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
  defaultPaymentMethodId: z.string().nullable().optional(),
  budgetMinCents: z.number().int().min(0).nullable().optional(),
  budgetMaxCents: z.number().int().min(0).nullable().optional(),
});

export const updateEstablishmentSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    emoji: z.string().max(10).optional(),
    subcategoryId: idSchema.optional(),
    defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
    defaultPaymentMethodId: z.string().nullable().optional(),
    budgetMinCents: z.number().int().min(0).nullable().optional(),
    budgetMaxCents: z.number().int().min(0).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const establishmentIdSchema = idSchema;

export type CreateEstablishmentInput = z.infer<typeof createEstablishmentSchema>;
export type UpdateEstablishmentInput = z.infer<typeof updateEstablishmentSchema>;
