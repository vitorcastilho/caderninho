import { z } from 'zod';

import { idSchema, amountCentsSchema } from './common.schema';
import { PAYMENT_METHOD_TYPES } from '@/shared/constants/category.constants';

const paymentMethodRefine = (data: {
  defaultPaymentMethodType?: string | null;
  defaultPaymentMethodId?: string | null;
}) => {
  const hasType = data.defaultPaymentMethodType != null;
  const hasId = data.defaultPaymentMethodId != null;
  return hasType === hasId;
};

const paymentMethodRefineMessage = 'Tipo e instrumento de pagamento devem ser preenchidos juntos';

export const createCategorySchema = z
  .object({
    name: z.string().min(1, 'Nome da categoria é obrigatório').max(100),
    classificationId: idSchema,
    budgetMinCents: amountCentsSchema.nullable().optional(),
    budgetMaxCents: amountCentsSchema.nullable().optional(),
    defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
    defaultPaymentMethodId: idSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.budgetMaxCents != null && data.budgetMinCents == null) return false;
      if (data.budgetMaxCents != null && data.budgetMinCents != null && data.budgetMaxCents < data.budgetMinCents) return false;
      return true;
    },
    { message: 'Orçamento máximo deve ser maior ou igual ao mínimo' },
  )
  .refine(paymentMethodRefine, { message: paymentMethodRefineMessage });

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    classificationId: idSchema.optional(),
    budgetMinCents: amountCentsSchema.nullable().optional(),
    budgetMaxCents: amountCentsSchema.nullable().optional(),
    defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
    defaultPaymentMethodId: idSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  })
  .refine(
    (data) => {
      if (data.budgetMaxCents != null && data.budgetMinCents == null) return false;
      if (data.budgetMaxCents != null && data.budgetMinCents != null && data.budgetMaxCents < data.budgetMinCents) return false;
      return true;
    },
    { message: 'Orçamento máximo deve ser maior ou igual ao mínimo' },
  )
  .refine(paymentMethodRefine, { message: paymentMethodRefineMessage });

export const categoryIdSchema = idSchema;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
