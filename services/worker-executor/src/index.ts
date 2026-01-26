
import { Worker } from 'bullmq';
import { connection } from './lib/redis';
import { startScheduler } from './scheduler';
import { botProcessor } from './processors/botProcessor';

console.log('👷 Worker Engine Starting...');

// 1. Start the Scheduler (Producer)
startScheduler();

// 2. Start the Worker (Consumer)
const worker = new Worker('bot-execution', botProcessor, {
  connection,
  concurrency: 5, // Process 5 bots in parallel
  limiter: {
    max: 10,
    duration: 1000
  }
});

worker.on('completed', job => {
  console.log(`[Job] ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Job] ${job?.id} failed with ${err.message}`);
});

console.log('🚀 Worker Engine Online & Listening for Jobs');
