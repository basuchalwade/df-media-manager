import { Queue, QueueOptions, WorkerOptions, ConnectionOptions, Worker, Processor } from 'bullmq';

// Centralized Redis Connection
// Using a shared connection object helps manage connection limits in production
const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Standard Job Options
// Ensures resilience against network blips or API rate limits
const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s
  },
  removeOnComplete: 1000, // Keep history for debugging
  removeOnFail: 5000,     // Keep failures longer
};

// --- Constants ---

export const QUEUE_NAMES = {
  POST_PUBLISH: 'cc-post-publish',
  ENGAGEMENT: 'cc-engagement',
  GROWTH: 'cc-growth',
  FINDER: 'cc-finder',
  SCHEDULER: 'cc-scheduler-queue',
  EXECUTOR: 'cc-executor-queue',
  LEARNING: 'cc-learning-queue'
};

// --- Factories ---

export const createQueue = (name: string, options?: QueueOptions) => {
  return new Queue(name, {
    connection,
    defaultJobOptions,
    ...options
  });
};

export const createWorker = (name: string, processor: Processor, options?: WorkerOptions) => {
  return new Worker(name, processor, {
    connection,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
    ...options
  });
};

// --- Queue Definitions ---

/**
 * 1. Scheduler Queue
 * Handles the "Heartbeat" of the system.
 * Jobs here trigger the scanning of the database for bots ready to run.
 */
export const botSchedulerQueue = new Queue(QUEUE_NAMES.SCHEDULER, {
  connection,
  defaultJobOptions,
});

/**
 * 2. Executor Queue
 * The heavy lifter. Each job represents a single execution cycle
 * for a specific bot instance.
 */
export const botExecutorQueue = new Queue(QUEUE_NAMES.EXECUTOR, {
  connection,
  defaultJobOptions,
});

/**
 * 3. Learning Queue
 * Low-priority background processing for analyzing patterns
 * and generating strategy insights.
 */
export const learningQueue = new Queue(QUEUE_NAMES.LEARNING, {
  connection,
  defaultJobOptions: {
    ...defaultJobOptions,
    priority: 10, // Lower priority than execution
  },
});

// Shared Worker Config
export const workerConnectionConfig: WorkerOptions = {
  connection,
  concurrency: 5, // Process 5 bots in parallel per worker instance
  limiter: {
    max: 10,      // Max 10 jobs
    duration: 1000, // per second (Global Rate Limiting Protection)
  },
};