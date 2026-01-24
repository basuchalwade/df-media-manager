
import { IBotPolicy, PolicyContext, PolicyResult } from './types';

export class BudgetPolicy implements IBotPolicy {
  name = 'BudgetPolicy';

  async evaluate(ctx: PolicyContext): Promise<PolicyResult> {
    if (ctx.trigger === 'MANUAL') {
      return { allowed: true, policyName: this.name };
    }

    // Mock Budget Check
    // In production: Sum Cost of all actions today for this bot's campaigns
    const dailySpend = 0; // await SpendService.getDailySpend(ctx.bot.id);
    const dailyLimit = 100; // From Campaign config

    if (dailySpend >= dailyLimit) {
      return {
        allowed: false,
        policyName: this.name,
        reason: `Daily budget limit reached ($${dailyLimit}).`
      };
    }

    return { allowed: true, policyName: this.name };
  }
}
