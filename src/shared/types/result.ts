type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };

export type { Result };

export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function err(
  code: string,
  message: string,
  details?: Record<string, string>,
): Result<never> {
  return { success: false, error: { code, message, ...(details && { details }) } };
}
