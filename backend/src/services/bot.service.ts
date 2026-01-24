
import { PrismaClient, BotType } from '@prisma/client';
import { OrchestrationService } from './orchestration.service';
import { GovernanceService } from './governance.service';
import { BotExecutorService } from './BotExecutorService';

const prisma = new PrismaClient();
const orchestration = new OrchestrationService();
const governance = new GovernanceService();
const executor = new BotExecutorService();

export class BotService {

  async getBots(organizationId: string) {
    // Filter by organizationId in schema if applicable, currently global in mock schema
    const bots = await prisma.botConfig.findMany({
      include: {
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return bots;
  }

  async updateConfig(organizationId: string, botType: string, config: any, learningConfig?: any) {
    // 1. Validate Config
    this.validateBotConfig(config);

    // 2. Audit Log
    await governance.logAction(organizationId, 'USER', 'UPDATE_CONFIG', 'Bot', botType, { config });

    // 3. Update DB
    const data: any = {
      configJson: config,
      updatedAt: new Date(),
    };
    if (learningConfig) data.learningConfigJson = learningConfig;

    return prisma.botConfig.update({
      where: { type: botType }, // In real multi-tenant, composite key (orgId, type)
      data
    });
  }

  async toggleBot(organizationId: string, botType: string) {
    const bot = await prisma.botConfig.findUnique({ where: { type: botType } });
    if (!bot) throw new Error('Bot not found');

    const newState = !bot.enabled;
    
    await governance.logAction(organizationId, 'USER', newState ? 'ENABLE' : 'DISABLE', 'Bot', botType, {});

    return prisma.botConfig.update({
      where: { type: botType },
      data: { 
        enabled: newState,
        status: newState ? 'Running' : 'Idle' 
      }
    });
  }

  async runSimulation(organizationId: string, botType: string) {
    // 1. Check Policy
    const policyCheck = await orchestration.checkGlobalPolicy(organizationId, 'SIMULATION');
    if (!policyCheck.allowed) {
      throw new Error(policyCheck.reason);
    }

    // 2. Trigger Logic
    // In production, this would add a job to a queue. For now, calling executor directly.
    // Fire and forget promise to not block response
    executor.executeBotCycle('sim-id', botType).catch(console.error);

    return { status: 'queued', message: 'Simulation started' };
  }

  // --- Helpers ---

  private validateBotConfig(config: any) {
    if (config.safetyLevel === 'Aggressive' && !config.humanOversight) {
      // Example rule
      // throw new Error("Aggressive mode requires human oversight enabled.");
    }
    // Add schema validation (Zod) here
  }
}
