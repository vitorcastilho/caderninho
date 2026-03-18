import { z } from 'zod';

export const AuditAction = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'LINK_ACCOUNT',
]);

export type AuditAction = z.infer<typeof AuditAction>;

export const auditLogSchema = z.object({
  action: AuditAction,
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  oldValue: z.record(z.string(), z.unknown()).optional(),
  newValue: z.record(z.string(), z.unknown()).optional(),
});

export type AuditLogInput = z.infer<typeof auditLogSchema>;
