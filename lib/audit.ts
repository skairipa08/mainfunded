import type { Db } from 'mongodb';

export type AuditAction =
  | 'student.verified'
  | 'student.rejected'
  | 'campaign.status_changed'
  | 'user.role_changed'
  | 'payout.processed'
  | 'login.failed';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  audit_id: string;
  actor_user_id: string;
  actor_email: string;
  action: AuditAction;
  target_type: string;
  target_id: string;
  target_details?: Record<string, unknown>;
  ip_address: string;
  severity: AuditSeverity;
  timestamp: string;
}

/**
 * Write an audit log entry to the `audit_logs` collection.
 * Failures are swallowed so they never break the calling flow.
 */
export async function logAudit(
  db: Db,
  params: {
    actor_user_id: string;
    actor_email: string;
    action: AuditAction;
    target_type: string;
    target_id: string;
    target_details?: Record<string, unknown>;
    ip_address: string;
    severity?: AuditSeverity;
  },
): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      audit_id: `audit_${Date.now()}`,
      actor_user_id: params.actor_user_id,
      actor_email: params.actor_email,
      action: params.action,
      target_type: params.target_type,
      target_id: params.target_id,
      target_details: params.target_details ?? {},
      ip_address: params.ip_address || 'unknown',
      severity: params.severity ?? 'info',
      timestamp: new Date().toISOString(),
    };

    await db.collection('audit_logs').insertOne(entry);
  } catch (error) {
    // Never throw — audit must not break business flows
    console.error('[Audit] Failed to write audit log:', error);
  }
}
