
/**
 * src/services/ai/governance/DecisionExplainer.ts
 * 
 * "Translate AI logic into Human Language."
 * 
 * RESPONSIBILITY:
 * - Takes raw audit entries and generates stakeholder-friendly explanations.
 * - Essential for "Explainable AI" (XAI) requirements in enterprise.
 */

import { DecisionAuditEntry } from './GovernanceTypes';

export class DecisionExplainer {

  /**
   * Generates a human-readable summary of the decision.
   */
  static explainDecision(entry: DecisionAuditEntry): string {
    const confidencePct = Math.round(entry.confidenceScore * 100);
    const sourceLabel = this.formatSource(entry.source);
    
    let explanation = `The ${sourceLabel} proposed a ${this.formatType(entry.decisionType)} decision with ${confidencePct}% confidence.`;

    // Add Reasoning
    explanation += `\n\nReasoning: ${entry.reasoning}`;

    // Add Pattern Context (Phase 10.3 Integration)
    if (entry.influencedByPatterns && entry.influencedByPatterns.length > 0) {
      explanation += `\n\nHistorical Context: This decision was influenced by ${entry.influencedByPatterns.length} past success patterns found in memory.`;
    }

    // Add Status Context
    if (entry.status === 'PROPOSED') {
      explanation += `\n\nStatus: Pending human approval.`;
    } else if (entry.status === 'APPROVED') {
      explanation += `\n\nStatus: Approved by ${entry.approvalRecord?.approvedBy} on ${entry.approvalRecord?.approvedAt.toLocaleDateString()}.`;
    }

    return explanation;
  }

  private static formatSource(source: string): string {
    switch (source) {
      case 'RULE_ENGINE': return 'Rules Engine';
      case 'MEMORY_ENGINE': return 'Strategy Memory';
      case 'PORTFOLIO_ENGINE': return 'Portfolio Optimizer';
      default: return 'AI System';
    }
  }

  private static formatType(type: string): string {
    return type.toLowerCase().replace('_', ' ');
  }
}
