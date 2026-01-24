
import { Worker, Job } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';
import { BOT_QUEUE_NAME, BotJobPayload } from '../queues/bot.queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const botWorker = new Worker<BotJobPayload>(
  BOT_QUEUE_NAME,
  async (job: Job<BotJobPayload>) => {
    const { botId, trigger } = job.data;
    console.log(`[Worker] Starting job ${job.id}: ${botId} (${trigger})`);

    try {
      // 1. Log Lifecycle: STARTED
      await prisma.botLog.create({
        data: {
          botId, // Currently schema uses type as ID/relation key
          level: 'Info',
          message: `Execution STARTED (${trigger})`
        }
      });

      // 2. Simulate Execution Logic
      // In production, this would call specific service logic (Creator vs Engagement)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // 3. Update Bot State (Last Run)
      await prisma.botConfig.update({
        where: { type: botId },
        data: { 
          lastRun: new Date(),
          status: 'Idle' // Reset status after run
        }
      });

      // 4. Log Lifecycle: COMPLETED
      await prisma.botLog.create({
        data: {
          botId,
          level: 'Success',
          message: `Execution COMPLETED successfully.`
        }
      });

      console.log(`[Worker] Job ${job.id} completed.`);

    } catch (error: any) {
      console.error(`[Worker] Job ${job.id} failed:`, error);

      // Log Lifecycle: FAILED
      await prisma.botLog.create({
        data: {
          botId,
          level: 'Error',
          message: `Execution FAILED: ${error.message}`
        }
      });

      // Update Bot Status
      await prisma.botConfig.update({
        where: { type: botId },
        data: { status: 'Error' }
      });

      throw error; // Let BullMQ handle retry logic
    }
  },
  { 
    connection: redisConnectionOptions,
    concurrency: 5 // Allow 5 concurrent bots
  }
);
