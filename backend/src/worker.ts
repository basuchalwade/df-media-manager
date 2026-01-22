
import { createWorker, QUEUE_NAMES } from './lib/queue';
import { postExecutor } from './executors/postExecutor';
import { botExecutor } from './executors/botExecutor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function startWorker() {
  console.log('🚀 Starting Worker Service...');
  console.log(`Environment: ${process.env.SIMULATION_MODE === 'true' ? 'SIMULATION' : 'PRODUCTION'}`);

  // 1. Post Publishing Worker
  createWorker(QUEUE_NAMES.POST_PUBLISH, postExecutor);

  // 2. Bot Workers (Engagement, Growth, Finder)
  createWorker(QUEUE_NAMES.ENGAGEMENT, botExecutor);
  createWorker(QUEUE_NAMES.GROWTH, botExecutor);
  createWorker(QUEUE_NAMES.FINDER, botExecutor);

  console.log('✅ Workers are listening for jobs.');
}

startWorker().catch(e => {
  console.error(e);
  process.exit(1);
});
