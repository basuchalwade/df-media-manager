
import { Queue } from 'bullmq';
import { redisOptions } from '../lib/redis';
import { QUEUE_NAMES, BotSchedulerJob, ActionExecutorJob, MediaProcessorJob } from './types';
import { botQueue } from './bot.queue';

// Create Queues
export const botSchedulerQueue = new Queue<BotSchedulerJob>(QUEUE_NAMES.BOT_SCHEDULER, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: { count: 100 }, 
    removeOnFail: { count: 500 },     
  },
});

export const actionExecutorQueue = new Queue<ActionExecutorJob>(QUEUE_NAMES.ACTION_EXECUTOR, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 2, 
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: 1000,
  },
});

export const mediaProcessorQueue = new Queue<MediaProcessorJob>(QUEUE_NAMES.MEDIA_PROCESSOR, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 10000 },
  },
});

// Re-export botQueue
export { botQueue };

// Graceful shutdown helper
export const closeQueues = async () => {
  await Promise.all([
    botSchedulerQueue.close(),
    actionExecutorQueue.close(),
    mediaProcessorQueue.close(),
    botQueue.close(),
  ]);
};
