
/**
 * src/services/ai/governance/ApprovalWorkflow.ts
 * 
 * Manages the "Human-in-the-Loop" lifecycle.
 * 
 * RESPONSIBILITY:
 * - Transitions decisions from PROPOSED -> APPROVED/REJECTED.
 * - Updates the Audit Log with the actor's identity.
 */

import { auditLog } from './DecisionAuditLog';
import { DecisionAuditEntry } from './GovernanceTypes';

export class ApprovalWorkflow {

  /**
   * Moves a decision to 'PROPOSED' state (if not already).
   * In a real system, this might trigger a Slack/Email notification to the user.
   */
  static requestApproval(decisionId: string): void {
    const decision = auditLog.getDecisionById(decisionId);
    if (!decision) throw new Error("Decision not found");

    if (decision.status !== 'PROPOSED') {
      auditLog.updateStatus(decisionId, { status: 'PROPOSED' });
      console.log(`[Governance] Approval requested for ${decisionId}`);
    }
  }

  /**
   * Grants human approval to an AI decision.
   */
  static approveDecision(decisionId: string, approverName: string, notes?: string): void {
    const decision = auditLog.getDecisionById(decisionId);
    if (!decision) throw new Error("Decision not found");

    const record = {
      decisionId,
      approvedBy: approverName,
      approvedAt: new Date(),
      notes
    };

    auditLog.updateStatus(decisionId, {
      status: 'APPROVED',
      approvalRecord: record
    });

    console.log(`[Governance] Decision ${decisionId} APPROVED by ${approverName}.`);
    // Future: Trigger execution callback here
  }

  /**
   * Rejects an AI decision.
   */
  static rejectDecision(decisionId: string, approverName: string, reason: string): void {
    const decision = auditLog.getDecisionById(decisionId);
    if (!decision) throw new Error("Decision not found");

    // We don't delete the record; we mark it REJECTED for audit history.
    auditLog.updateStatus(decisionId, {
      status: 'REJECTED',
      reasoning: `${decision.reasoning} [REJECTED: ${reason}]` // Append rejection note to reasoning
    });

    console.log(`[Governance] Decision ${decisionId} REJECTED by ${approverName}.`);
  }
}
