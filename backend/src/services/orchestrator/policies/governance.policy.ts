
import { IBotPolicy, PolicyContext, PolicyResult } from './types';

export class GovernancePolicy implements IBotPolicy {
  name = 'GovernancePolicy';

  async evaluate(ctx: PolicyContext): Promise<PolicyResult> {
    const config = ctx.bot.configJson as any;

    // Check if strict approval is required for this bot type
    if (config?.requiresApproval) {
      // Check for override flag in metadata (passed from API)
      if (ctx.meta?.adminOverride) {
        return { 
          allowed: true, 
          policyName: this.name, 
          reason: 'Admin Override applied.' 
        };
      }

      return {
        allowed: false,
        policyName: this.name,
        reason: 'Governance: Bot requires explicit approval for execution. Admin override missing.'
      };
    }

    return { allowed: true, policyName: this.name };
  }
}
