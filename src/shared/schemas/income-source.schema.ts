import { z } from 'zod';

import { idSchema } from './common.schema';

export const employmentTypeSchema = z.enum(['pj_propria', 'clt', 'freelance', 'outro']);

export const createIncomeSourceSchema = z.object({
  name: z.string().min(1, 'Nome da fonte de receita é obrigatório').max(100),
  employmentType: employmentTypeSchema,
  isRecurring: z.boolean(),
  baseAmountCents: z.number().int().positive('Valor base deve ser positivo').optional(),
  usualPaymentDay: z.number().int().min(1, 'Dia deve ser entre 1 e 31').max(31, 'Dia deve ser entre 1 e 31').optional(),
});

export const updateIncomeSourceSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    employmentType: employmentTypeSchema.optional(),
    isRecurring: z.boolean().optional(),
    baseAmountCents: z.number().int().positive().nullable().optional(),
    usualPaymentDay: z.number().int().min(1).max(31).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const incomeSourceIdSchema = idSchema;

export type CreateIncomeSourceInput = z.infer<typeof createIncomeSourceSchema>;
export type UpdateIncomeSourceInput = z.infer<typeof updateIncomeSourceSchema>;
export type EmploymentType = z.infer<typeof employmentTypeSchema>;
