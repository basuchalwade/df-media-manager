
import { PrismaClient } from '@prisma/client';
import { botQueue } from '../../queues/bot.queue';

const prisma = new PrismaClient();

export class BotOrchestrator {
  
  /**
   * Central gatekeeper for bot execution.
   * Checks permissions, logs audit trails, and enqueues the job if approved.
   */
  static async authorizeAndQueueBotRun(
    botId: string, // In this schema, botId is often the 'type' string (e.g. 'Creator Bot')
    tenantId: string, 
    trigger: 'SCHEDULED' | 'MANUAL' | 'RETRY'
  ): Promise<{ accepted: boolean; reason?: string }> {
    
    // 1. Fetch Bot Configuration
    // Note: Assuming 'type' is unique per tenant or global in current schema
    const bot = await prisma.botConfig.findUnique({ where: { type: botId } });

    if (!bot) {
      return { accepted: false, reason: 'Bot configuration not found' };
    }

    // 2. Policy Check
    if (!bot.enabled && trigger !== 'MANUAL') {
      return { accepted: false, reason: 'Bot is disabled' };
    }

    // 3. Governance: Log Intent (DecisionAudit)
    // We record that the system *intends* to run the bot.
    await prisma.decisionAudit.create({
      data: {
        decisionType: 'BOT_ACTION',
        source: 'RULE_ENGINE',
        description: `Orchestrator authorizing ${trigger} run for ${botId}`,
        reasoning: `Triggered by ${trigger}`,
        confidenceScore: 1.0,
        status: 'PROPOSED',
        // In full multi-tenant schema, link to tenantId here
      }
    });

    // 4. Enqueue Job
    await botQueue.add(`run-${botId}-${Date.now()}`, {
      botId,
      tenantId,
      trigger
    });

    // 5. Log activity start attempt
    // (Optional: Worker will log the actual start, but this acknowledges receipt)
    console.log(`[Orchestrator] Enqueued job for ${botId} (${trigger})`);

    return { accepted: true };
  }
}
