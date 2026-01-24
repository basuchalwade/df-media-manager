
/**
 * src/services/ai/governance/GovernanceEngine.ts
 * 
 * The primary facade for the Governance Layer.
 * 
 * RESPONSIBILITY:
 * - Provides a simple API for other AI services (Rules, Memory) to register decisions.
 * - Ensures a consistent audit trail creation process.
 * 
 * INTEGRATION GUIDE:
 * - Call `GovernanceEngine.recordAIDecision(...)` immediately after the AI calculates a suggestion.
 * - Use the returned ID to track approval status via `ApprovalWorkflow`.
 */

import { auditLog } from './DecisionAuditLog';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { DecisionExplainer } from './DecisionExplainer';
import { DecisionAuditEntry, DecisionSource, DecisionType } from './GovernanceTypes';

interface RecordDecisionParams {
  decisionType: DecisionType;
  source: DecisionSource;
  description: string;
  reasoning: string;
  confidenceScore: number;
  campaignId?: string;
  botId?: string;
  patterns?: string[]; // IDs of influencing patterns
}

export class GovernanceEngine {

  /**
   * Registers a new AI decision into the audit system.
   * By default, high-impact decisions start as 'PROPOSED'.
   */
  static recordAIDecision(params: RecordDecisionParams): string {
    const id = `dec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Auto-approve low-risk/high-confidence decisions? 
    // For Phase 11, we default everything to PROPOSED for strict governance.
    // Future: if (confidence > 0.95 && type === 'BOT_ACTION') status = 'EXECUTED'
    
    const entry: DecisionAuditEntry = {
      id,
      timestamp: new Date(),
      status: 'PROPOSED',
      ...params
    };

    auditLog.logDecision(entry);
    return id;
  }

  // Expose helper modules
  static get log() { return auditLog; }
  static get workflow() { return ApprovalWorkflow; }
  static get explainer() { return DecisionExplainer; }
}

/*
 * --- MOCK USAGE EXAMPLE ---
 * 
 * // 1. AI (Phase 10.2) calculates a suggestion
 * const suggestion = {
 *   title: "Increase Budget",
 *   reason: "ROAS is high (3.5x)",
 *   confidence: 0.85
 * };
 * 
 * // 2. Record it in Governance (Phase 11)
 * const decisionId = GovernanceEngine.recordAIDecision({
 *   decisionType: "BUDGET_REALLOCATION",
 *   source: "RULE_ENGINE",
 *   description: suggestion.title,
 *   reasoning: suggestion.reason,
 *   confidenceScore: suggestion.confidence,
 *   campaignId: "camp-123",
 *   patterns: ["pat-123"] // Influenced by Memory (Phase 10.3)
 * });
 * 
 * // 3. Explain to User
 * const entry = GovernanceEngine.log.getDecisionById(decisionId);
 * if (entry) {
 *   console.log(GovernanceEngine.explainer.explainDecision(entry));
 *   // Output: "The Rules Engine proposed a budget reallocation decision with 85% confidence..."
 * }
 * 
 * // 4. Human Approves
 * GovernanceEngine.workflow.approveDecision(decisionId, "Admin User");
 */
