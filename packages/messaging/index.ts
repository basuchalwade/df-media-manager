
import { Queue, Worker, QueueOptions, WorkerOptions, Processor } from 'bullmq';
import IORedis from 'ioredis';

// Shared Redis Config
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

const connection = new IORedis(redisConfig);

export const QUEUES = {
  BOT_EXECUTION: 'bot-execution',
  POST_PUBLISH: 'post-publish',
  ANALYTICS: 'analytics-aggregation'
};

export class MessageBus {
  private queues: Record<string, Queue> = {};

  getQueue(name: string): Queue {
    if (!this.queues[name]) {
      this.queues[name] = new Queue(name, { connection });
    }
    return this.queues[name];
  }

  async publish(queueName: string, jobName: string, data: any, opts?: any) {
    const queue = this.getQueue(queueName);
    return queue.add(jobName, data, opts);
  }

  createWorker(queueName: string, processor: Processor, opts?: WorkerOptions) {
    return new Worker(queueName, processor, { 
      connection, 
      ...opts 
    });
  }
}

export const bus = new MessageBus();
