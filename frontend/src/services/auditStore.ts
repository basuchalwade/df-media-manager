
import { MediaAuditEvent } from '../types';

let auditEvents: MediaAuditEvent[] = [];

// Seed initial audit logs
const seedLogs: MediaAuditEvent[] = [
  {
    id: 'audit-1',
    mediaId: 'm1',
    action: 'UPLOAD',
    actor: 'System Seed',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'audit-2',
    mediaId: 'm1',
    action: 'APPROVED',
    actor: 'Admin',
    timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(),
  }
];

if (auditEvents.length === 0) {
    auditEvents = [...seedLogs];
}

export function logAudit(event: MediaAuditEvent) {
  auditEvents.unshift(event);
}

export function getAuditForMedia(mediaId: string) {
  return auditEvents.filter(e => e.mediaId === mediaId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
