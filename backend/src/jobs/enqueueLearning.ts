
import { learningQueue } from '../lib/queue';

/**
 * Triggers the Learning Engine to analyze recent campaign performance.
 * Typically scheduled to run nightly or after significant campaign milestones.
 * 
 * @param tenantId - Organization to analyze
 */
export const enqueueLearningAnalysis = async (tenantId: string) => {
  // Use a static job ID suffix to prevent duplicate analysis jobs 
  // from stacking up if the worker is slow.
  const jobId = `learning-${tenantId}-nightly`;

  await learningQueue.add(
    'strategy-analysis',
    { tenantId },
    {
      jobId, // Deduplication key
      removeOnComplete: true
    }
  );

  console.log(`[Queue] Enqueued Learning Analysis for Tenant: ${tenantId}`);
};
