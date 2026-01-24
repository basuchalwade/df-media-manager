
import { IBotPolicy, PolicyContext, PolicyResult } from './types';

export class QuietHoursPolicy implements IBotPolicy {
  name = 'QuietHoursPolicy';

  async evaluate(ctx: PolicyContext): Promise<PolicyResult> {
    // 1. Bypass for Manual Triggers
    if (ctx.trigger === 'MANUAL') {
      return { allowed: true, policyName: this.name, reason: 'Manual override active' };
    }

    // 2. Determine Timezone (Mock: Default to UTC if not in config)
    const config = ctx.bot.configJson as any;
    const timezone = config?.workHours?.timezone || 'UTC';
    
    // 3. Check Time
    // Using a simple check for 23:00 to 06:00
    const now = new Date();
    // In a real app, use date-fns-tz to get local time in target timezone
    const currentHour = now.getUTCHours(); 

    // Block between 23 (11 PM) and 6 (6 AM)
    // Note: This is a simplified UTC check. Production needs proper TZ conversion.
    if (currentHour >= 23 || currentHour < 6) {
      return {
        allowed: false,
        policyName: this.name,
        reason: `Execution blocked during global quiet hours (23:00 - 06:00 UTC). Current: ${currentHour}:00`
      };
    }

    return { allowed: true, policyName: this.name };
  }
}
