
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BotEngine {
  
  static async executeBotCycle(botType: string) {
    console.log(`[BotEngine] Starting cycle for: ${botType}`);
    
    // 1. Fetch Config
    const config = await prisma.botConfig.findUnique({ where: { type: botType } });
    if (!config) {
      console.error(`[BotEngine] Config not found for ${botType}`);
      return;
    }

    if (!config.enabled) {
      console.log(`[BotEngine] ${botType} is disabled. Skipping.`);
      return;
    }

    if (config.isPausedBySystem) {
      // Create a 'SKIPPED' activity log
      await prisma.botActivity.create({
        data: {
          botType,
          actionType: 'ANALYZE',
          platform: 'All', // System level
          status: 'SKIPPED',
          message: 'Circuit breaker active. Bot is paused due to consecutive errors.',
        }
      });
      return;
    }

    // 2. Start Activity
    const activity = await prisma.botActivity.create({
      data: {
        botType,
        actionType: this.determineActionType(botType),
        platform: 'Twitter', // Default for simulation, would be dynamic
        status: 'STARTED',
        message: 'Bot cycle initiated.',
      }
    });

    try {
      // 3. Update Status
      await prisma.botConfig.update({
        where: { type: botType },
        data: { status: 'Running', lastRun: new Date() }
      });

      // 4. Run Logic (Simulation / Actual)
      const result = await this.performBotLogic(botType, config.config);

      // 5. Success
      await prisma.botActivity.update({
        where: { id: activity.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          message: result.message,
          metadata: result.metadata
        }
      });

      // Reset Health
      await prisma.botConfig.update({
        where: { type: botType },
        data: { 
          status: 'Idle',
          consecutiveErrors: 0 
        }
      });

    } catch (error: any) {
      console.error(`[BotEngine] Error in ${botType}:`, error);

      // 6. Failure Handling
      const consecutiveErrors = config.consecutiveErrors + 1;
      const shouldPause = config.config?.['stopOnConsecutiveErrors'] 
        ? consecutiveErrors >= config.config['stopOnConsecutiveErrors'] 
        : false;

      await prisma.botActivity.update({
        where: { id: activity.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          message: 'Cycle failed due to internal error.',
          error: error.message
        }
      });

      await prisma.botConfig.update({
        where: { type: botType },
        data: { 
          status: shouldPause ? 'Error' : 'Idle',
          consecutiveErrors,
          isPausedBySystem: shouldPause
        }
      });
    }
  }

  // --- Logic Helpers ---

  private static determineActionType(type: string): string {
    switch (type) {
      case 'Creator Bot': return 'POST';
      case 'Engagement Bot': return 'REPLY';
      case 'Growth Bot': return 'FOLLOW';
      case 'Finder Bot': return 'ANALYZE';
      default: return 'ANALYZE';
    }
  }

  private static async performBotLogic(type: string, config: any): Promise<{ message: string, metadata: any }> {
    // SIMULATION OF COMPLEX LOGIC
    // In a real app, this would call TwitterAPI, OpenAI, etc.
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Latency

    // Random failure injection (10% chance)
    if (Math.random() < 0.1) {
      throw new Error("Simulated platform connection timeout (504)");
    }

    if (type === 'Engagement Bot') {
      return {
        message: 'Replied to user @tech_guru regarding AI trends.',
        metadata: { targetUser: '@tech_guru', tweetId: '123456789' }
      };
    }

    if (type === 'Creator Bot') {
      return {
        message: 'Drafted new post about "SaaS Marketing".',
        metadata: { topic: 'SaaS Marketing', wordCount: 45 }
      };
    }
    
    if (type === 'Growth Bot') {
      return {
        message: 'Followed 3 new accounts in #Startup sector.',
        metadata: { accounts: ['@start1', '@found2', '@vc3'] }
      };
    }

    return {
      message: 'Scanned 50 recent posts. No actionable trends found.',
      metadata: { itemsScanned: 50 }
    };
  }
}
