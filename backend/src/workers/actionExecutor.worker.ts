
import { Worker, Job } from 'bullmq';
import { redisOptions } from '../lib/redis';
import { QUEUE_NAMES, ActionExecutorJob } from '../queues/types';
import { OrchestrationService } from '../services/orchestration.service';
import { GovernanceService } from '../services/governance.service';
import { BotService } from '../services/bot.service'; // Assuming logic exists or adding stub
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orchestration = new OrchestrationService();
const governance = new GovernanceService();
const botService = new BotService();

export const actionExecutorWorker = new Worker<ActionExecutorJob>(
  QUEUE_NAMES.ACTION_EXECUTOR,
  async (job: Job<ActionExecutorJob>) => {
    const { tenantId, botId, botType, actionType, platform, traceId } = job.data;
    console.log(`[ActionExecutor] ${botType} executing ${actionType} [Trace: ${traceId}]`);

    // 1. Orchestration: Global Policy Check
    const orchCheck = await orchestration.checkGlobalPolicy(tenantId, actionType);
    if (!orchCheck.allowed) {
      console.warn(`[ActionExecutor] Blocked by Orchestration: ${orchCheck.reason}`);
      await governance.logAction(tenantId, botId, 'BLOCKED_POLICY', 'Bot', botId, { reason: orchCheck.reason, traceId });
      return;
    }

    // 2. Orchestration: Conflict Check
    if (platform) {
      const conflictCheck = await orchestration.checkConflicts(tenantId, botType, platform);
      if (!conflictCheck.allowed) {
        console.warn(`[ActionExecutor] Blocked by Conflict: ${conflictCheck.reason}`);
        // Backoff? Or just skip. For now, skip.
        await governance.logAction(tenantId, botId, 'BLOCKED_CONFLICT', 'Bot', botId, { reason: conflictCheck.reason, traceId });
        return;
      }
    }

    // 3. Governance: Approval Check
    const requiresApproval = await governance.requiresApproval(tenantId, actionType, 'MEDIUM'); // Defaulting risk to MEDIUM
    if (requiresApproval) {
      console.log(`[ActionExecutor] Action requires approval. Pausing execution.`);
      await governance.createApprovalRequest(tenantId, botId, job.data);
      return;
    }

    // 4. Execution
    try {
      // Call Domain Service to perform the actual logic
      // Note: We are mocking the specific execution call here as BotService usually handles config updates.
      // In P2, we'd have `botService.executeAction(botId, actionType, payload)`
      
      // Simulate execution time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 5. Log Success
      await governance.logAction(tenantId, botId, `EXECUTE_${actionType}`, 'Bot', botId, { status: 'SUCCESS', platform, traceId });
      console.log(`[ActionExecutor] Success: ${botType} -> ${actionType}`);

    } catch (error: any) {
      console.error(`[ActionExecutor] Execution Failed:`, error);
      await governance.logAction(tenantId, botId, `EXECUTE_FAILED`, 'Bot', botId, { error: error.message, traceId });
      throw error; // Trigger BullMQ retry
    }
  },
  { connection: redisOptions, concurrency: 5 } // Process 5 actions in parallel per worker instance
);
