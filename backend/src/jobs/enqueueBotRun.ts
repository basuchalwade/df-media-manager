
import { botExecutorQueue } from '../lib/queue';

export interface BotRunPayload {
  botId: string;
  tenantId: string;
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT';
}

/**
 * Pushes a bot execution job into the queue.
 * This is the primary entry point for the "Swarm" logic.
 * 
 * @param botId - The Database ID of the bot to run
 * @param tenantId - Organization ID for context/security
 * @param triggerType - Why is this running?
 */
export const enqueueBotRun = async (
  botId: string, 
  tenantId: string, 
  triggerType: 'MANUAL' | 'SCHEDULED' | 'EVENT' = 'MANUAL'
) => {
  const jobName = `bot-run-${botId}-${Date.now()}`;
  
  await botExecutorQueue.add(jobName, {
    botId,
    tenantId,
    triggerType,
    timestamp: new Date().toISOString()
  });

  console.log(`[Queue] Enqueued Bot Execution: ${botId} (${triggerType})`);
};
