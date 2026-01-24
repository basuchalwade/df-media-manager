
import { PrismaClient } from '@prisma/client';
import { botQueue, TriggerSource } from '../../queues/bot.queue';
import { v4 as uuidv4 } from 'uuid';

// Policies
import { IBotPolicy } from './policies/types';
import { QuietHoursPolicy } from './policies/quietHours.policy';
import { CampaignStatusPolicy } from './policies/campaignStatus.policy';
import { BudgetPolicy } from './policies/budget.policy';
import { GovernancePolicy } from './policies/governance.policy';

const prisma = new PrismaClient();

export class BotOrchestrator {
  
  // Register Policies
  private static policies: IBotPolicy[] = [
    new GovernancePolicy(), // High priority security check first
    new QuietHoursPolicy(),
    new CampaignStatusPolicy(),
    new BudgetPolicy()
  ];

  /**
   * AUTHORIZE AND DISPATCH
   * 
   * The "Brain" that decides if a bot runs.
   * Evaluates all policies sequentially.
   */
  static async dispatchBotRun(
    botType: string,
    tenantId: string, 
    trigger: TriggerSource,
    meta?: any
  ): Promise<{ success: boolean; jobId?: string; reason?: string }> {
    
    const traceId = uuidv4();

    // 1. Load Bot with Context (Campaigns)
    const bot = await prisma.botConfig.findUnique({ 
      where: { type: botType },
      include: { campaigns: true } 
    });

    if (!bot) {
      return { success: false, reason: `Bot ${botType} not found.` };
    }

    // 2. Global Enable Check (Hard Gate)
    if (!bot.enabled && trigger !== 'MANUAL') {
      return { success: false, reason: 'Bot is globally disabled.' };
    }

    // 3. Policy Evaluation
    const context = { bot, tenantId, trigger, meta };
    
    for (const policy of this.policies) {
      try {
        const result = await policy.evaluate(context);
        
        if (!result.allowed) {
          console.warn(`[Orchestrator] Blocked by ${result.policyName}: ${result.reason}`);
          
          // Log Rejection Audit
          await this.logDecision(bot.id, 'BLOCKED_POLICY', `Blocked by ${result.policyName}`, result.reason || 'Policy check failed');
          
          // Log visible error for user
          await prisma.botLog.create({
            data: {
              botId: bot.type,
              level: 'Warning',
              message: `Run Skipped: ${result.reason}`
            }
          });

          return { success: false, reason: result.reason };
        }
      } catch (err: any) {
        console.error(`[Orchestrator] Policy Error (${policy.name}):`, err);
        return { success: false, reason: `Internal Policy Error: ${err.message}` };
      }
    }

    // 4. Log Approval Audit
    await this.logDecision(bot.id, 'BOT_ACTION', `Dispatching ${botType}`, `All policies passed. Trigger: ${trigger}`);

    // 5. Enqueue Job
    const job = await botQueue.add(
      'run-bot-logic',
      {
        botId: bot.type,
        tenantId,
        trigger,
        traceId
      },
      {
        jobId: `run-${botType}-${Date.now()}`
      }
    );

    console.log(`[Orchestrator] Dispatched ${botType} (Job: ${job.id})`);
    return { success: true, jobId: job.id };
  }

  private static async logDecision(botId: string, type: string, desc: string, reason: string) {
    await prisma.decisionAudit.create({
      data: {
        decisionType: type,
        source: 'ORCHESTRATOR',
        description: desc,
        reasoning: reason,
        confidenceScore: 1.0,
        status: type === 'BLOCKED_POLICY' ? 'REJECTED' : 'PROPOSED',
        botId: botId, // Linking using internal UUID if possible, or handling relation elsewhere
      }
    });
  }
}
