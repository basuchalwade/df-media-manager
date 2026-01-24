
import { IBotPolicy, PolicyContext, PolicyResult } from './types';

export class CampaignStatusPolicy implements IBotPolicy {
  name = 'CampaignStatusPolicy';

  async evaluate(ctx: PolicyContext): Promise<PolicyResult> {
    // 1. Bypass for Manual/Test runs if needed, but usually we want context even for manual
    // Allowing MANUAL to run without campaign for testing purposes
    if (ctx.trigger === 'MANUAL') {
       return { allowed: true, policyName: this.name, reason: 'Manual test mode' };
    }

    const activeCampaigns = ctx.bot.campaigns.filter(c => c.status === 'Active');

    if (activeCampaigns.length === 0) {
      return {
        allowed: false,
        policyName: this.name,
        reason: 'Bot is not assigned to any Active campaign.'
      };
    }

    return { allowed: true, policyName: this.name };
  }
}
