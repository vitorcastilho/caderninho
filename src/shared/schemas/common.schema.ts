import { z } from 'zod';

// IDs de entidade (UUID v4)
export const idSchema = z.string().uuid();

// Valores monetarios em centavos (integer >= 0)
export const amountCentsSchema = z.number().int().nonnegative();

// Valores monetarios positivos (integer > 0)
export const positiveAmountCentsSchema = z.number().int().positive();

// Percentuais em basis points (0-10000 = 0%-100%)
export const percentBasisPointsSchema = z.number().int().min(0).max(10000);

// Paginacao
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

// Range de datas
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'Data final deve ser posterior a data inicial',
  });

// Ordenacao
export const sortSchema = z.object({
  field: z.string(),
  direction: z.enum(['asc', 'desc']).default('desc'),
});

// Tipos inferidos
export type Id = z.infer<typeof idSchema>;
export type AmountCents = z.infer<typeof amountCentsSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Sort = z.infer<typeof sortSchema>;
