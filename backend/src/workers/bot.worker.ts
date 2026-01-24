
import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnectionOptions } from '../lib/redis';
import { BOT_QUEUE_NAME, BotRunJobPayload } from '../queues/bot.queue';

// Reusing Prisma client instance or creating a dedicated one for the worker
const prisma = new PrismaClient();

export const botWorker = new Worker<BotRunJobPayload>(
  BOT_QUEUE_NAME,
  async (job: Job<BotRunJobPayload>) => {
    const { botId, tenantId } = job.data;
    console.log(`[Worker] Processing Job ${job.id}: Bot ${botId}`);

    try {
      // 1. Load Bot from DB
      // Using 'findUnique' on 'type' as per existing schema patterns, or 'id' if available. 
      // Assuming 'botId' passed is the unique identifier (type or uuid).
      const bot = await prisma.botConfig.findFirst({
        where: { 
          OR: [
            { id: botId },
            { type: botId } // Fallback if ID is actually the type string
          ]
        }
      });

      if (!bot) {
        console.warn(`[Worker] Bot ${botId} not found. Skipping.`);
        return;
      }

      if (!bot.enabled) {
        console.info(`[Worker] Bot ${botId} is disabled. Skipping.`);
        return;
      }

      // 2. Log Execution Start
      await prisma.botLog.create({
        data: {
          botId: bot.type, // Linking via Type based on schema
          level: 'Info',
          message: `Worker started execution (Job: ${job.id})`
        }
      });

      // 3. Simulate Execution
      // In a real scenario, this calls the BotEngine logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Update Bot State
      await prisma.botConfig.update({
        where: { id: bot.id },
        data: {
          lastRun: new Date(),
          status: 'Idle',
          stats: {
            ...(bot.stats as object),
            totalRuns: ((bot.stats as any)?.totalRuns || 0) + 1
          }
        }
      });

      // 5. Log Completion
      await prisma.botLog.create({
        data: {
          botId: bot.type,
          level: 'Success',
          message: `Worker completed execution successfully.`
        }
      });

      console.log(`[Worker] Job ${job.id} finished.`);

    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} failed:`, error);

      // Log Failure safely
      try {
        await prisma.botLog.create({
          data: {
            botId: botId, 
            level: 'Error',
            message: `Worker execution failed: ${error.message}`
          }
        });
      } catch (logError) {
        console.error('[Worker] Failed to write error log to DB', logError);
      }

      throw error; // Rethrow to let BullMQ handle retries
    }
  },
  {
    connection: redisConnectionOptions,
    concurrency: 5, // Process up to 5 bots simultaneously per worker instance
    limiter: {
      max: 10,
      duration: 1000, // Rate limit: max 10 jobs per second
    },
  }
);

// Optional: specific error handling for the worker instance
botWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} permanently failed: ${err.message}`);
});
