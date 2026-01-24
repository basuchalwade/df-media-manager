
/**
 * src/services/ai/governance/DecisionAuditLog.ts
 * 
 * The persistent storage mechanism for governance records.
 * 
 * RESPONSIBILITY:
 * - Store the "Chain of Thought" and final decisions of the AI.
 * - Provide query capabilities for audit interfaces.
 * 
 * FUTURE:
 * Replace in-memory array with a high-throughput database table (e.g., Postgres, TimescaleDB).
 * Audit logs should be append-only (WORM - Write Once Read Many) for compliance.
 */

import { DecisionAuditEntry, DecisionType } from './GovernanceTypes';

class DecisionAuditLog {
  private static instance: DecisionAuditLog;
  private logs: DecisionAuditEntry[] = [];

  private constructor() {}

  public static getInstance(): DecisionAuditLog {
    if (!DecisionAuditLog.instance) {
      DecisionAuditLog.instance = new DecisionAuditLog();
    }
    return DecisionAuditLog.instance;
  }

  /**
   * Persists a decision entry.
   */
  public logDecision(entry: DecisionAuditEntry): void {
    this.logs.push(entry);
    console.log(`[Governance] Logged decision: ${entry.id} [${entry.status}]`);
  }

  /**
   * Retrieves specific decision by ID.
   */
  public getDecisionById(id: string): DecisionAuditEntry | undefined {
    return this.logs.find(log => log.id === id);
  }

  /**
   * Updates the status of a decision (e.g., after approval).
   */
  public updateStatus(id: string, updates: Partial<DecisionAuditEntry>): void {
    const index = this.logs.findIndex(l => l.id === id);
    if (index !== -1) {
      this.logs[index] = { ...this.logs[index], ...updates };
    }
  }

  // --- Queries ---

  public getDecisionsByCampaign(campaignId: string): DecisionAuditEntry[] {
    return this.logs
      .filter(l => l.relatedCampaignId === campaignId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getDecisionsByType(type: DecisionType): DecisionAuditEntry[] {
    return this.logs.filter(l => l.decisionType === type);
  }

  public getRecentDecisions(limit: number = 50): DecisionAuditEntry[] {
    return this.logs
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const auditLog = DecisionAuditLog.getInstance();
