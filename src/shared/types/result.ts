type Result<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: Record<string, string> } };

export type { Result };
