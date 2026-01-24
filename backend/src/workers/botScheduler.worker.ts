
import { Worker, Job } from 'bullmq';
import { redisOptions } from '../lib/redis';
import { QUEUE_NAMES, BotSchedulerJob } from '../queues/types';
import { actionExecutorQueue } from '../queues';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const botSchedulerWorker = new Worker<BotSchedulerJob>(
  QUEUE_NAMES.BOT_SCHEDULER,
  async (job: Job<BotSchedulerJob>) => {
    const { campaignId, tenantId, traceId } = job.data;
    console.log(`[BotScheduler] Processing Campaign ${campaignId} [Trace: ${traceId}]`);

    // 1. Load Campaign & Assigned Bots
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId, organizationId: tenantId },
      include: { bots: true }
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found or access denied.`);
    }

    if (campaign.status !== 'Active') {
      console.log(`[BotScheduler] Campaign ${campaign.name} is ${campaign.status}. Skipping.`);
      return;
    }

    // 2. Determine actions for each bot
    // In a real scenario, this logic checks the Campaign's strategy to decide WHAT actions to queue.
    // For P1-B, we assume a standard "Wake Up" cycle for all assigned bots.

    const jobsToQueue = campaign.bots.map(bot => {
      // Logic to determine action type based on BotType
      let actionType: 'POST' | 'REPLY' | 'FOLLOW' | 'ANALYZE' = 'ANALYZE';
      if (bot.type === 'Creator Bot') actionType = 'POST';
      if (bot.type === 'Engagement Bot') actionType = 'REPLY';
      if (bot.type === 'Growth Bot') actionType = 'FOLLOW';

      return actionExecutorQueue.add(
        `exec-${bot.type}-${Date.now()}`,
        {
          tenantId,
          traceId: uuidv4(), // New trace for the sub-task, linked via logs if needed
          campaignId: campaign.id,
          botId: bot.id,
          botType: bot.type,
          actionType,
          platform: 'Twitter', // Defaulting for MVP, logic should extract from Campaign config
        },
        {
          jobId: `camp-${campaignId}-bot-${bot.id}-${Date.now()}` // Idempotency key
        }
      );
    });

    await Promise.all(jobsToQueue);
    console.log(`[BotScheduler] Scheduled ${jobsToQueue.length} bot actions.`);
  },
  { connection: redisOptions }
);
