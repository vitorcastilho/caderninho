export interface AuditLogParams {
  userId: string | null;
  organizationId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export type AuditLogger = (params: AuditLogParams) => Promise<void>;
