
import { BotConfig, Campaign } from '@prisma/client';
import { TriggerSource } from '../../../queues/bot.queue';

// Extend Prisma type to include relations needed for policies
export type PolicyBotContext = BotConfig & { 
  campaigns: Campaign[]; 
};

export interface PolicyContext {
  bot: PolicyBotContext;
  tenantId: string;
  trigger: TriggerSource;
  meta?: any; // For passing overrides like admin flags
}

export interface PolicyResult {
  allowed: boolean;
  policyName: string;
  reason?: string;
  meta?: any;
}

export interface IBotPolicy {
  name: string;
  evaluate(ctx: PolicyContext): Promise<PolicyResult>;
}
