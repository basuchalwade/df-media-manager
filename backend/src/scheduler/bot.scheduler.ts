import { PrismaClient } from '@prisma/client';
import { BotOrchestrator } from '../services/orchestrator/botOrchestrator';

const prisma = new PrismaClient();
const POLL_INTERVAL_MS = 60000; // 60 seconds

export class BotScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    console.log('[Scheduler] Starting bot scheduler...');
    this.runCheck(); // Run immediately
    this.timer = setInterval(() => this.runCheck(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    console.log('[Scheduler] Stopped.');
  }

  private async runCheck() {
    try {
      // 1. Find all enabled bots
      const bots = await prisma.botConfig.findMany({
        where: { enabled: true }
      });

      console.log(`[Scheduler] Checking ${bots.length} active bots...`);

      for (const bot of bots) {
        // Logic: Check if lastRun + interval < now
        const lastRun = bot.lastRun ? new Date(bot.lastRun).getTime() : 0;
        const nextRun = lastRun + (bot.intervalMinutes * 60 * 1000);
        const now = Date.now();

        if (now >= nextRun) {
          // 2. Dispatch to Orchestrator
          // Using a placeholder tenantId as schema currently doesn't enforce it strictly on BotConfig
          await BotOrchestrator.dispatchBotRun(bot.type, 'system-tenant', 'SCHEDULED');
        }
      }
    } catch (error) {
      console.error('[Scheduler] Error during check cycle:', error);
    }
  }
}

export const botScheduler = new BotScheduler();