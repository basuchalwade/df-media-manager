
import { Worker } from 'bullmq';
import { workerConnectionConfig, botSchedulerQueue } from '../lib/queue';
import { PrismaClient } from '@prisma/client';
import { enqueueBotRun } from '../jobs/enqueueBotRun';

const prisma = new PrismaClient();

/**
 * The Scheduler Worker
 * 
 * Instead of relying on a centralized cron process, this worker acts 
 * as a "Scanner". It is triggered every minute (by a Repeatable Job)
 * to check the database for bots that are due for execution.
 * 
 * Benefits:
 * - Scalable: Multiple schedulers can run if partitioned.
 * - DB-Driven: Intervals are managed in Postgres, not code.
 */
const worker = new Worker(
  botSchedulerQueue.name,
  async (job) => {
    console.log('[Worker:Scheduler] Scanning for due bots...');

    try {
      // 1. Find bots enabled and due
      // Logic: lastRun + intervalMinutes < now
      // Note: This is a raw query logic simplification for Prisma
      const dueBots = await prisma.botConfig.findMany({
        where: {
          enabled: true,
          status: { not: 'Error' }, // Don't auto-run errored bots
          OR: [
            { lastRun: null }, // Never run
            {
              // This logic typically requires a raw query or computing the date in JS
              // For robustness here, we fetch potential candidates and filter in memory 
              // (Optimization: Move date math to SQL in production)
              lastRun: {
                lte: new Date(Date.now() - 1000 * 60) // Simple optimization: only fetch if run > 1 min ago
              }
            }
          ]
        }
      });

      let dispatchedCount = 0;
      const now = new Date();

      for (const bot of dueBots) {
        const lastRun = bot.lastRun ? new Date(bot.lastRun) : new Date(0);
        const nextRun = new Date(lastRun.getTime() + bot.intervalMinutes * 60000);

        if (now >= nextRun) {
          // 2. Dispatch Job
          // We assume organizationId is available on the bot record or related user
          // For P3 schema, assuming bot belongs to an Org or User. 
          // Using a placeholder tenantId if schema isn't fully strict yet.
          const tenantId = 'system-scheduler'; 

          await enqueueBotRun(bot.id, tenantId, 'SCHEDULED');
          dispatchedCount++;
        }
      }

      console.log(`[Worker:Scheduler] Dispatched ${dispatchedCount} bots.`);

    } catch (error) {
      console.error('[Worker:Scheduler] Error scanning bots:', error);
      throw error;
    }
  },
  workerConnectionConfig
);

export default worker;
