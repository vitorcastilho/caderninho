import type { ZodSchema, ZodError } from 'zod';
import { ok, err } from '@/shared/types/result';
import type { Result } from '@/shared/types/result';

function formatZodErrors(error: ZodError): Record<string, string> {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    details[path || '_root'] = issue.message;
  }
  return details;
}

export function validateInput<T>(schema: ZodSchema<T>, data: unknown): Result<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return ok(result.data);
  }
  return err('VALIDATION_ERROR', 'Dados invalidos', formatZodErrors(result.error));
}
