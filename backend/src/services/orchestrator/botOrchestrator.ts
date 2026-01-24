
import { PrismaClient } from '@prisma/client';
import { botQueue, TriggerSource } from '../../queues/bot.queue';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class BotOrchestrator {
  
  /**
   * AUTHORIZE AND DISPATCH
   * 
   * This is the "Strategist" layer. It does NOT execute the bot.
   * It checks if the bot *should* run, logs the decision, and delegates to the worker.
   */
  static async dispatchBotRun(
    botType: string, // In this schema, we often use 'type' as the ID
    tenantId: string, 
    trigger: TriggerSource
  ): Promise<{ success: boolean; jobId?: string; reason?: string }> {
    
    const traceId = uuidv4();

    // 1. Load Bot State
    const bot = await prisma.botConfig.findUnique({ where: { type: botType } });

    if (!bot) {
      return { success: false, reason: `Bot ${botType} not found in configuration.` };
    }

    // 2. Policy Check: Enabled?
    if (!bot.enabled && trigger !== 'MANUAL') {
      // We allow MANUAL overrides, but scheduled runs are blocked if disabled
      return { success: false, reason: 'Bot is disabled.' };
    }

    // 3. Governance: Log the Intent (DecisionAudit)
    // We record that the system *decided* to run the bot.
    await prisma.decisionAudit.create({
      data: {
        decisionType: 'BOT_ACTION',
        source: 'RULE_ENGINE', // or 'SCHEDULER'
        description: `Dispatching ${botType} for execution.`,
        reasoning: `Triggered by ${trigger}. Trace: ${traceId}`,
        confidenceScore: 1.0,
        status: 'PROPOSED', // Status is PROPOSED until Worker picks it up
        botId: bot.id, 
        // organizationId: tenantId (if schema supports)
      }
    });

    // 4. Enqueue (Delegate to Worker)
    const job = await botQueue.add(
      'run-bot-logic',
      {
        botId: bot.type, // Passing 'type' as ID based on current schema usage
        tenantId,
        trigger,
        traceId
      },
      {
        jobId: `run-${botType}-${Date.now()}` // Prevent duplicate queuing in same ms
      }
    );

    console.log(`[Orchestrator] Dispatched ${botType} (Job: ${job.id})`);

    return { success: true, jobId: job.id };
  }
}
