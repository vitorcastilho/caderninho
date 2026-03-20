import { z } from 'zod';

import { idSchema } from './common.schema';

export const createClassificationSchema = z.object({
  name: z.string().min(1, 'Nome da classificação é obrigatório').max(100),
  displayOrder: z.number().int().min(0, 'Ordem de exibição deve ser >= 0'),
});

export const updateClassificationSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    displayOrder: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser informado',
  });

export const mergeClassificationsSchema = z.object({
  sourceId: idSchema,
  targetId: idSchema,
});

export const classificationIdSchema = idSchema;

export type CreateClassificationInput = z.infer<typeof createClassificationSchema>;
export type UpdateClassificationInput = z.infer<typeof updateClassificationSchema>;
export type MergeClassificationsInput = z.infer<typeof mergeClassificationsSchema>;
