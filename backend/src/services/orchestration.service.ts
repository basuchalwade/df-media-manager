
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrchestrationService {
  
  /**
   * Check if an action is allowed based on global policies (Emergency Stop, Quiet Hours).
   */
  async checkGlobalPolicy(organizationId: string, actionType: string): Promise<{ allowed: boolean; reason?: string }> {
    // In a real implementation, fetch GlobalSettings table for the org.
    // For MVP, we default to allowing unless specific hardcoded logic triggers.
    
    const settings = await this.getSettings(organizationId);

    // 1. Emergency Stop
    if (settings.emergencyStop) {
      return { allowed: false, reason: 'Global Emergency Stop is active.' };
    }

    // 2. Quiet Hours
    if (settings.quietHoursEnabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const start = parseInt(settings.quietHoursStart.split(':')[0]);
      const end = parseInt(settings.quietHoursEnd.split(':')[0]);

      // Simple overnight check logic
      const isQuietTime = start > end 
        ? (currentHour >= start || currentHour < end)
        : (currentHour >= start && currentHour < end);

      if (isQuietTime) {
        return { allowed: false, reason: `Action blocked during Quiet Hours (${settings.quietHoursStart} - ${settings.quietHoursEnd}).` };
      }
    }

    return { allowed: true };
  }

  /**
   * Check for conflicts between bots acting on similar targets or platforms.
   */
  async checkConflicts(organizationId: string, botType: string, platform: string): Promise<{ allowed: boolean; reason?: string }> {
    // Example: Prevent multiple high-frequency bots on the same platform simultaneously
    const activeRuns = await prisma.botRun.count({
      where: {
        // organizationId, // Add organization relation to BotRun in schema later
        status: 'RUNNING',
        startedAt: { gt: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 mins
      }
    });

    if (activeRuns > 5) {
      return { allowed: false, reason: 'Too many concurrent bot executions. Throttling.' };
    }

    return { allowed: true };
  }

  // Mock settings retriever
  private async getSettings(organizationId: string) {
    // Fallback defaults
    return {
      emergencyStop: false,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '06:00'
    };
  }
}
