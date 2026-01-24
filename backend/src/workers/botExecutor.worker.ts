
import { Worker, Job } from 'bullmq';
import { workerConnectionConfig, botExecutorQueue } from '../lib/queue';
import { PrismaClient, BotType } from '@prisma/client';
import { BotRunPayload } from '../jobs/enqueueBotRun';

const prisma = new PrismaClient();

/**
 * The Bot Executor Worker
 * 
 * Responsibilities:
 * 1. Hydrate Bot Configuration
 * 2. Governance Check (Audit Log)
 * 3. Execute Platform Logic (Simulated for Phase P3)
 * 4. Log Outcome
 */
const worker = new Worker<BotRunPayload>(
  botExecutorQueue.name,
  async (job: Job<BotRunPayload>) => {
    const { botId, tenantId, triggerType } = job.data;
    const logPrefix = `[Worker:Executor:${botId}]`;

    console.log(`${logPrefix} Starting execution cycle.`);

    try {
      // 1. Load Bot State
      const bot = await prisma.botConfig.findUnique({
        where: { id: botId },
        include: { campaigns: true } // Assuming relation exists
      });

      if (!bot) throw new Error(`Bot ${botId} not found`);
      if (!bot.enabled && triggerType !== 'MANUAL') {
        console.warn(`${logPrefix} Bot is disabled. Skipping scheduled run.`);
        return;
      }

      // 2. Governance: Log Intent
      // We record that a machine is about to take an action
      await prisma.decisionAudit.create({
        data: {
          decisionType: 'BOT_ACTION',
          source: 'RULE_ENGINE',
          description: `Initiating ${bot.type} execution cycle`,
          reasoning: `Triggered by ${triggerType}`,
          confidenceScore: 1.0,
          status: 'EXECUTED',
          botId: bot.id,
          // organizationId: tenantId (if schema supports)
        }
      });

      // 3. Execution Simulation (The "Brain")
      let actionResult = '';
      
      switch (bot.type) {
        case 'Creator Bot':
          // Simulation: Draft a post
          actionResult = 'Drafted 3 new posts based on trending topics.';
          // In real implementation: Call OpenAI -> Save to DB
          break;

        case 'Engagement Bot':
          // Simulation: Like/Reply
          actionResult = 'Analyzed 50 mentions. Replied to 2 high-priority users.';
          break;

        case 'Growth Bot':
          // Simulation: Follow/Unfollow
          actionResult = 'Followed 5 relevant accounts in target niche.';
          break;

        case 'Finder Bot':
          // Simulation: Scrape trends
          actionResult = 'Identified 3 viral keywords for campaign usage.';
          break;
      }

      // 4. Update Bot State
      // Persist the "Memory" of this run
      const stats = (bot.stats as any) || {};
      const newStats = {
        ...stats,
        totalRuns: (stats.totalRuns || 0) + 1,
        lastActionResult: actionResult
      };

      await prisma.botConfig.update({
        where: { id: botId },
        data: {
          lastRun: new Date(),
          stats: newStats,
          status: 'Idle' // Reset status to Idle after run
        }
      });

      // 5. Write Bot Log (User facing log)
      await prisma.botLog.create({
        data: {
          botId,
          level: 'Info',
          message: `Cycle Complete: ${actionResult}`
        }
      });

      console.log(`${logPrefix} Success: ${actionResult}`);

    } catch (error: any) {
      console.error(`${logPrefix} Failed:`, error);

      // Log Failure to DB
      await prisma.botLog.create({
        data: {
          botId,
          level: 'Error',
          message: `Execution Failed: ${error.message}`
        }
      });

      // Update Bot Status to Error
      await prisma.botConfig.update({
        where: { id: botId },
        data: { status: 'Error' }
      });

      throw error; // Rethrow to let BullMQ handle retries
    }
  },
  workerConnectionConfig
);

export default worker;
