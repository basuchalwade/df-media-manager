
import { createWorker, QUEUE_NAMES } from './lib/queue';
import { postExecutor } from './executors/postExecutor';
import { BotEngine } from './services/botEngine';
import * as Prisma from '@prisma/client';

const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();
const IS_SIMULATION = process.env.SIMULATION_MODE === 'true';

async function startWorker() {
  console.log('🚀 Starting Worker Service...');
  console.log(`Environment: ${IS_SIMULATION ? 'SIMULATION (In-Memory)' : 'PRODUCTION (Redis)'}`);

  // 1. Post Publishing (Always Keep Queue for Scheduled Posts if possible, or use simple checks in Sim)
  // For simplicity, we keep the postExecutor as is, assuming createWorker handles the shim if needed
  createWorker(QUEUE_NAMES.POST_PUBLISH, postExecutor);

  if (!IS_SIMULATION) {
    // 2. Production: Listen to Redis Queues for Bots
    createWorker(QUEUE_NAMES.ENGAGEMENT, async (job: any) => await BotEngine.executeBotCycle('Engagement Bot'));
    createWorker(QUEUE_NAMES.GROWTH, async (job: any) => await BotEngine.executeBotCycle('Growth Bot'));
    createWorker(QUEUE_NAMES.FINDER, async (job: any) => await BotEngine.executeBotCycle('Finder Bot'));
    
    console.log('✅ [Production] Workers are listening to Redis queues.');
  } else {
    // 3. Simulation: Use setInterval to mimic queue triggers
    console.log('✅ [Simulation] Starting internal cron timers for Bots.');
    
    const bots = ['Engagement Bot', 'Growth Bot', 'Finder Bot', 'Creator Bot'];
    
    bots.forEach(botType => {
      // Random interval between 10s and 30s for demo liveliness
      const interval = Math.floor(Math.random() * 20000) + 10000;
      
      setInterval(() => {
        BotEngine.executeBotCycle(botType).catch(console.error);
      }, interval);
      
      console.log(`   -> Scheduled ${botType} every ~${interval/1000}s`);
    });
  }
}

startWorker().catch(e => {
  console.error(e);
  process.exit(1);
});
