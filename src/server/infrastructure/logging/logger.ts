const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'credential',
  'authorization',
  'cookie',
  'cpf',
  'ssn',
  'accesstoken',
  'refreshtoken',
  'sessiontoken',
]);

function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return Array.from(SENSITIVE_FIELDS).some((field) => lowerKey.includes(field));
}

function sanitizeData(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

interface LogParams {
  action: string;
  userId?: string;
  organizationId?: string;
  data?: Record<string, unknown>;
  error?: string;
}

function formatLog(level: string, params: LogParams): string {
  const entry: Record<string, unknown> = {
    level,
    action: params.action,
    timestamp: new Date().toISOString(),
  };

  if (params.userId) entry.userId = params.userId;
  if (params.organizationId) entry.organizationId = params.organizationId;
  if (params.data) entry.data = sanitizeData(params.data);
  if (params.error) entry.error = params.error;

  return JSON.stringify(entry);
}

function info(params: LogParams): void {
  console.log(formatLog('info', params));
}

function warn(params: LogParams): void {
  console.log(formatLog('warn', params));
}

function error(params: LogParams): void {
  console.error(formatLog('error', params));
}

export const logger = { info, warn, error };
