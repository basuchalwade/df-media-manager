
import { Queue } from 'bullmq';
import { prisma } from './lib/db';
import { connection } from './lib/redis';

const botQueue = new Queue('bot-execution', { connection });

/**
 * Checks for bots that need to run.
 * Interval: 10 seconds (Simulated "Fast" environment)
 */
export const startScheduler = () => {
  console.log('⏰ Scheduler started...');
  
  setInterval(async () => {
    try {
      // 1. Find Enabled Bots
      const bots = await prisma.botConfig.findMany({
        where: { enabled: true }
      });

      const now = new Date();

      for (const bot of bots) {
        // 2. Check if due (Last run + Interval < Now)
        // If never run, run immediately
        const lastRun = bot.lastRun ? new Date(bot.lastRun) : new Date(0);
        const nextRun = new Date(lastRun.getTime() + bot.intervalMinutes * 60000);

        // For demo purposes, if interval is large, we might want to speed it up. 
        // But let's respect the DB config.
        // NOTE: In production, use `nextRun < now`.
        
        // Check if already processing (simple lock via status)
        if (bot.status !== 'Running' && (now >= nextRun)) {
          console.log(`[Scheduler] Enqueuing ${bot.type}...`);
          
          await botQueue.add('execute-bot', { 
            botId: bot.id 
          }, {
            removeOnComplete: true,
            removeOnFail: 100
          });
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error:', error);
    }
  }, 10000); // Check every 10 seconds
};
