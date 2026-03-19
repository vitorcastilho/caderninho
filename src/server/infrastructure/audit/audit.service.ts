import { db } from '@/server/infrastructure/database/client';
import { auditLogs } from '@/server/infrastructure/database/schema/audit-logs';
import { logger } from '@/server/infrastructure/logging/logger';

interface AuditLogParams {
  userId: string | null;
  organizationId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      ...params,
    });
  } catch (error) {
    // Auditoria NUNCA bloqueia operacao principal
    logger.warn({
      action: 'audit_log_failed',
      data: { entityType: params.entityType, entityId: params.entityId },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
