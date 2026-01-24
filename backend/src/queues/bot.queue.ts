
import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';

export const BOT_QUEUE_NAME = 'bot-execution-queue';

export type TriggerSource = 'MANUAL' | 'SCHEDULED' | 'EVENT' | 'RETRY';

export interface BotJobPayload {
  botId: string;        // Database ID (or unique Type if singleton)
  tenantId: string;     // Multi-tenancy context
  trigger: TriggerSource;
  traceId: string;      // Distributed tracing ID
}

/**
 * The Communication Channel.
 * This queue holds "Intents" for bots to execute.
 */
export const botQueue = new Queue<BotJobPayload>(BOT_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 100, // Keep last 100 for debugging
    removeOnFail: 500,     // Keep failures longer
  },
});
