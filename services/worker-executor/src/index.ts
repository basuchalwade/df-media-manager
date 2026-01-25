
import dotenv from 'dotenv';
import { bus, QUEUES } from '../../../packages/messaging';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

console.log("👷 Worker Executor Service Starting...");

// --- 1. Bot Execution Worker ---
bus.createWorker(QUEUES.BOT_EXECUTION, async (job) => {
  const { botId, organizationId, actionType } = job.data;
  console.log(`[Job ${job.id}] Executing ${actionType} for Bot ${botId}`);

  try {
    // Logic placeholder:
    // 1. Fetch Bot Config
    // 2. Execute Action (e.g. Call Twitter API)
    // 3. Log Audit Success
    
    await prisma.decisionAudit.create({
      data: {
        organizationId,
        decisionType: 'BOT_ACTION',
        source: 'WORKER',
        description: `Executed ${actionType}`,
        reasoning: 'Scheduled Job',
        status: 'EXECUTED',
        snapshotJson: { jobId: job.id, result: 'Success' }
      }
    });

  } catch (error: any) {
    console.error(`Job failed:`, error);
    // Log Audit Failure
    await prisma.decisionAudit.create({
      data: {
        organizationId,
        decisionType: 'BOT_ACTION',
        source: 'WORKER',
        description: `Failed to execute ${actionType}`,
        reasoning: error.message,
        status: 'FAILED',
        snapshotJson: { jobId: job.id }
      }
    });
    throw error;
  }
});

// --- 2. Post Publishing Worker ---
bus.createWorker(QUEUES.POST_PUBLISH, async (job) => {
  console.log(`[Job ${job.id}] Publishing Post ${job.data.postId}`);
  // Publish logic...
});
