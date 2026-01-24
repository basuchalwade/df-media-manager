
import { PrismaClient, BotType } from '@prisma/client';
import { OrchestrationService } from './orchestration.service';
import { GovernanceService } from './governance.service';
import { enqueueBotRun } from '../queues/bot.queue';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const orchestration = new OrchestrationService();
const governance = new GovernanceService();

export class BotService {

  async getBots(organizationId: string) {
    // Filter by organizationId in schema if applicable
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
      where: { type: botType },
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

    // 2. Resolve Bot ID
    // We need the database ID for the job, but for now using botType as the logical ID
    // in this specific schema setup where Type is unique.
    const bot = await prisma.botConfig.findUnique({ where: { type: botType } });
    if (!bot) throw new Error(`Bot ${botType} not found.`);

    // 3. Enqueue Job
    const traceId = uuidv4();
    const job = await enqueueBotRun(bot.type, organizationId, 'API', traceId);

    // 4. Log Audit
    await governance.logAction(organizationId, 'USER', 'TRIGGER_RUN', 'Bot', bot.type, { jobId: job.id, traceId });

    return { status: 'queued', jobId: job.id, message: 'Simulation run queued successfully' };
  }

  // --- Helpers ---

  private validateBotConfig(config: any) {
    if (config.safetyLevel === 'Aggressive' && !config.humanOversight) {
      // Example rule
      // throw new Error("Aggressive mode requires human oversight enabled.");
    }
  }
}
