
import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';

export const BOT_QUEUE_NAME = 'bot-execution';

export interface BotRunJobPayload {
  botId: string;
  tenantId: string;
  triggeredBy: string; // 'API' | 'SCHEDULER'
}

// The Queue instance
export const botQueue = new Queue<BotRunJobPayload>(BOT_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 1000, // Keep last 1000 successful jobs
    removeOnFail: 5000,     // Keep last 5000 failed jobs for debugging
  },
});

/**
 * Producer: Enqueue a bot run job
 */
export const enqueueBotRun = async (botId: string, tenantId: string) => {
  const jobId = `run-${botId}-${Date.now()}`;
  
  await botQueue.add(
    'execute-bot', 
    {
      botId,
      tenantId,
      triggeredBy: 'API'
    },
    { jobId } // Prevent duplicate jobs if triggered rapidly with same ID
  );

  return { jobId, status: 'queued' };
};
