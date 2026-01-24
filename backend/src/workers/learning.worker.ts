
import { Worker, Job } from 'bullmq';
import { workerConnectionConfig, learningQueue } from '../lib/queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * The Learning Worker
 * 
 * Runs asynchronously to analyze performance data and generate "Wisdom".
 * This populates the 'StrategyPattern' table which the AI uses for future decisions.
 */
const worker = new Worker(
  learningQueue.name,
  async (job: Job<{ tenantId: string }>) => {
    const { tenantId } = job.data;
    console.log(`[Worker:Learning] Analyzing strategy for ${tenantId}...`);

    try {
      // 1. Fetch recent successful posts
      // (Mocking the data fetch for the logic flow)
      const recentSuccesses = await prisma.post.findMany({
        where: {
          // organizationId: tenantId, 
          status: 'Published',
          // metrics: { engagementRate: { gt: 0.05 } } // Theoretical schema
        },
        take: 50,
        orderBy: { createdAt: 'desc' }
      });

      if (recentSuccesses.length === 0) {
        console.log('[Worker:Learning] No sufficient data to analyze.');
        return;
      }

      // 2. Mock Analysis Logic
      // In production, this calls a Python service or runs extensive math
      const insight = `Posts published between 9AM-11AM are performing 20% better.`;
      
      // 3. Save Strategy Pattern
      await prisma.strategyPattern.create({
        data: {
          description: insight,
          confidence: 0.85,
          evidenceCount: recentSuccesses.length,
          applicableObjectives: ['ENGAGEMENT'],
          applicablePlatforms: ['Twitter', 'LinkedIn'],
          // organizationId: tenantId
        }
      });

      // 4. Create Suggestion (Optimization Intent)
      // We don't apply it automatically yet, just notify the system
      console.log(`[Worker:Learning] Generated Insight: ${insight}`);

    } catch (error) {
      console.error('[Worker:Learning] Analysis failed:', error);
      // We do NOT throw here to avoid retrying heavy analysis jobs repeatedly. 
      // Just log and exit.
    }
  },
  workerConnectionConfig
);

export default worker;
