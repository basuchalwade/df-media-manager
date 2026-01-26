
import { Queue } from 'bullmq';
import { redisOptions } from '../lib/redis';

export interface BotRunJob {
  botId: string;
  tenantId: string;
  triggeredBy: 'API' | 'SCHEDULER';
  traceId?: string;
}

export const BOT_RUN_QUEUE_NAME = 'bot-run';

/**
 * Bot Run Queue
 * Handles requests to wake up a specific bot and execute its cycle.
 * This decouples the API from the heavy lifting of bot logic.
 */
export const botQueue = new Queue<BotRunJob>(BOT_RUN_QUEUE_NAME, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100, // Keep history of last 100 successful runs
    removeOnFail: 500,     // Keep history of last 500 failed runs for debugging
  },
});

/**
 * Enqueue a bot run job.
 * @param botId - The unique identifier of the bot (or botType if unique per tenant)
 * @param tenantId - The organization ID owning the bot
 * @param triggeredBy - Source of the trigger
 * @param traceId - Distributed tracing ID
 */
export const enqueueBotRun = async (
  botId: string, 
  tenantId: string, 
  triggeredBy: 'API' | 'SCHEDULER' = 'API',
  traceId?: string
) => {
  // Job ID is unique per trigger to prevent duplication if needed, 
  // or random to allow multiple concurrent runs (though bots are usually serial).
  // Using timestamp here allows concurrent triggers if they happen >1ms apart.
  return botQueue.add(`run-${botId}-${Date.now()}`, {
    botId,
    tenantId,
    triggeredBy,
    traceId
  });
};
