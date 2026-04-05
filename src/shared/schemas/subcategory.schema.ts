import { z } from 'zod';

import { idSchema } from './common.schema';
import { PAYMENT_METHOD_TYPES } from '@/shared/constants/category.constants';

const paymentMethodRefine = (data: {
  defaultPaymentMethodType?: string | null;
  defaultPaymentMethodId?: string | null;
}) => {
  const hasType = data.defaultPaymentMethodType != null;
  const hasId = data.defaultPaymentMethodId != null;
  return hasType === hasId;
};

const updatePaymentMethodRefine = (data: {
  defaultPaymentMethodType?: string | null;
  defaultPaymentMethodId?: string | null;
}) => {
  const typeProvided = data.defaultPaymentMethodType !== undefined;
  const idProvided = data.defaultPaymentMethodId !== undefined;

  if (!typeProvided && !idProvided) return true;
  if (typeProvided !== idProvided) return false;

  const hasType = data.defaultPaymentMethodType != null;
  const hasId = data.defaultPaymentMethodId != null;
  return hasType === hasId;
};

const paymentMethodRefineMessage = 'Tipo e instrumento de pagamento devem ser preenchidos juntos';

export const createSubcategorySchema = z
  .object({
    name: z.string().min(1, 'Nome da subcategoria é obrigatório').max(100),
    emoji: z.string().max(10).optional(),
    categoryId: idSchema,
    defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
    defaultPaymentMethodId: idSchema.nullable().optional(),
  })
  .refine(paymentMethodRefine, { message: paymentMethodRefineMessage });

export const updateSubcategorySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    emoji: z.string().max(10).optional(),
    defaultPaymentMethodType: z.enum(PAYMENT_METHOD_TYPES).nullable().optional(),
    defaultPaymentMethodId: idSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  })
  .refine(updatePaymentMethodRefine, { message: paymentMethodRefineMessage });

export const subcategoryIdSchema = idSchema;

export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;
