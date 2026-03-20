import { z } from 'zod';

import { idSchema, amountCentsSchema } from './common.schema';

export const investmentTypeSchema = z.enum(['renda_fixa', 'renda_variavel', 'reserva']);

export const createInvestmentSchema = z
  .object({
    name: z.string().min(1, 'Nome do investimento é obrigatório').max(100),
    institution: z.string().min(1, 'Instituição é obrigatória').max(100),
    type: investmentTypeSchema,
    balanceCents: amountCentsSchema,
    yieldRateBasisPoints: z.number().int().nonnegative().optional(),
    maturityDate: z.string().date().optional(),
  })
  .refine(
    (data) =>
      data.type === 'renda_variavel' || data.yieldRateBasisPoints !== undefined,
    {
      message: 'Rendimento é obrigatório para Renda Fixa e Reserva',
      path: ['yieldRateBasisPoints'],
    },
  );

export const updateInvestmentSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    institution: z.string().min(1).max(100).optional(),
    type: investmentTypeSchema.optional(),
    balanceCents: amountCentsSchema.optional(),
    yieldRateBasisPoints: z.number().int().nonnegative().nullable().optional(),
    maturityDate: z.string().date().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const investmentIdSchema = idSchema;

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
export type InvestmentType = z.infer<typeof investmentTypeSchema>;
