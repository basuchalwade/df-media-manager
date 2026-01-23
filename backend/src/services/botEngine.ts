
import * as Prisma from '@prisma/client';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is available or using simplified generation

const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();

const SIMULATION_STEPS: Record<string, string[]> = {
  'Creator Bot': [
    "Analyzing trending topics...",
    "Drafting content with Gemini...",
    "Applying brand voice rules...",
    "Validating safety compliance...",
    "Scheduling post."
  ],
  'Engagement Bot': [
    "Checking new mentions...",
    "Filtering spam accounts...",
    "Generating replies...",
    "Applying human-delay...",
    "Reply posted."
  ],
  'Finder Bot': [
    "Scanning keywords...",
    "Analyzing sentiment...",
    "Filtering noise...",
    "Saving leads."
  ],
  'Growth Bot': [
    "Identifying target audience...",
    "Checking limits...",
    "Executing actions..."
  ]
};

export class BotEngine {
  
  static async executeBotCycle(botType: string) {
    console.log(`[BotEngine] Triggered cycle for: ${botType}`);
    
    // We do NOT await the internal process here to allow the API to return immediately
    // This effectively makes it "fire and forget" from the API controller's perspective
    this._runCycleAsync(botType).catch(err => {
        console.error(`[BotEngine] Background cycle failed for ${botType}`, err);
    });
  }

  private static async _runCycleAsync(botType: string) {
    // 1. Fetch Config
    const config = await prisma.botConfig.findUnique({ where: { type: botType } });
    if (!config) return;

    const runId = `run-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // 2. Initial Start Log
    await prisma.botActivity.create({
      data: {
        botType,
        runId,
        actionType: this.determineActionType(botType),
        platform: 'Twitter',
        status: 'STARTED',
        message: 'Bot cycle initiated.',
      }
    });

    try {
      // 3. Update Status
      await prisma.botConfig.update({
        where: { type: botType },
        data: { status: 'Running' }
      });

      // 4. Run Steps (Simulated Delay)
      const steps = SIMULATION_STEPS[botType] || SIMULATION_STEPS['Creator Bot'];
      
      for (const stepMsg of steps) {
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
          
          await prisma.botActivity.create({
              data: {
                  botType,
                  runId,
                  actionType: 'ANALYZE',
                  platform: 'Twitter',
                  status: 'STARTED', // Intermediate status
                  message: stepMsg
              }
          });
      }

      // 5. Final Success
      await new Promise(resolve => setTimeout(resolve, 500));
      await prisma.botActivity.create({
        data: {
          botType,
          runId,
          actionType: this.determineActionType(botType),
          platform: 'Twitter',
          status: 'SUCCESS',
          message: 'Cycle completed successfully.',
          finishedAt: new Date()
        }
      });

      // Reset & Update Stats
      const stats = (config.stats as any) || {};
      stats.currentDailyActions = (stats.currentDailyActions || 0) + 1;
      stats.consecutiveErrors = 0;

      await prisma.botConfig.update({
        where: { type: botType },
        data: { 
          status: 'Idle',
          lastRun: new Date(),
          consecutiveFailures: 0,
          stats: stats
        }
      });

    } catch (error: any) {
      console.error(`[BotEngine] Error in ${botType}:`, error);

      const consecutiveFailures = config.consecutiveFailures + 1;
      const stats = (config.stats as any) || {};
      stats.consecutiveErrors = consecutiveFailures;

      await prisma.botActivity.create({
        data: {
          botType,
          runId,
          actionType: 'ANALYZE',
          platform: 'System',
          status: 'FAILED',
          finishedAt: new Date(),
          message: 'Cycle failed due to internal error.',
          error: error.message
        }
      });

      await prisma.botConfig.update({
        where: { type: botType },
        data: { 
          status: 'Error',
          consecutiveFailures,
          stats: stats
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
}
