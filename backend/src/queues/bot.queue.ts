
import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../lib/redis';

export const BOT_QUEUE_NAME = 'bot-execution-queue';

export interface BotJobPayload {
  botId: string;
  tenantId: string;
  trigger: 'SCHEDULED' | 'MANUAL' | 'RETRY';
}

export const botQueue = new Queue<BotJobPayload>(BOT_QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
