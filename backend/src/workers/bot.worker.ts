
import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { BOT_QUEUE_NAME, BotJobPayload } from '../queues/bot.queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * WORKER PROCESS
 * 
 * This runs in the background, independent of the HTTP API.
 * It is restart-safe and idempotent.
 */
export const botWorker = new Worker<BotJobPayload>(
  BOT_QUEUE_NAME,
  async (job: Job<BotJobPayload>) => {
    const { botId, trigger, traceId } = job.data;
    console.log(`[Worker] Starting Job ${job.id}: ${botId} (${trigger})`);

    try {
      // 1. Re-hydration & Safety Check
      // We fetch fresh state. The bot might have been disabled since the job was queued.
      const bot = await prisma.botConfig.findUnique({ where: { type: botId } });

      if (!bot) throw new Error(`Bot ${botId} config missing.`);
      
      if (!bot.enabled && trigger !== 'MANUAL') {
        console.warn(`[Worker] Bot ${botId} disabled. Aborting job.`);
        return;
      }

      // 2. Lifecycle: STARTED
      // Log to user-facing activity log
      await prisma.botLog.create({
        data: {
          botId: bot.type,
          level: 'Info',
          message: `Cycle Started [${trigger}]`
        }
      });

      // Update internal status
      await prisma.botConfig.update({
        where: { id: bot.id },
        data: { status: 'Running' }
      });

      // 3. EXECUTION (Placeholder for actual API calls)
      // This is where the specific "Brain" logic for each bot type resides
      const executionTime = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // 4. Update State (Idempotency / Result)
      const stats = (bot.stats as any) || {};
      const newStats = {
        ...stats,
        totalRuns: (stats.totalRuns || 0) + 1,
        lastRunDuration: executionTime
      };

      await prisma.botConfig.update({
        where: { id: bot.id },
        data: {
          lastRun: new Date(),
          status: 'Idle',
          stats: newStats
        }
      });

      // 5. Lifecycle: COMPLETED & Audit
      await prisma.botLog.create({
        data: {
          botId: bot.type,
          level: 'Success',
          message: `Cycle Completed successfully (${executionTime}ms).`
        }
      });

      // Close the Governance Loop
      // In a real system, we might update the DecisionAudit record to 'EXECUTED'
      
      console.log(`[Worker] Job ${job.id} Finished.`);

    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} Failed:`, error);

      // Lifecycle: FAILED
      await prisma.botLog.create({
        data: {
          botId: botId,
          level: 'Error',
          message: `Cycle Failed: ${error.message}`
        }
      });

      // Set Error State
      await prisma.botConfig.update({
        where: { type: botId },
        data: { status: 'Error' } // Requires human intervention to reset
      });

      throw error; // Rethrow to let BullMQ handle backoff/retries
    }
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5, // Run up to 5 bots in parallel per worker instance
    limiter: {
      max: 10,      // Max 10 jobs
      duration: 1000 // per second (Rate limit protection)
    }
  }
);

botWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} permanently failed: ${err.message}`);
});
