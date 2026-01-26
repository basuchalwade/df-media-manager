
import { prisma } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export class BotService {
  async getBots(organizationId: string) {
    // Retrieve bots stored in Postgres
    // In production schema, we assume `BotConfig` model exists
    // If using the JSONB schema approach:
    const bots = await prisma.botConfig.findMany({
      // where: { organizationId } // Enable when schema supports Org relation on bots
      orderBy: { type: 'asc' }
    });
    
    // Map Prisma result to frontend shape if needed
    return bots.map((b: any) => ({
      ...b,
      config: b.configJson || {}, // Handle JSONB mapping
      stats: b.statsJson || { currentDailyActions: 0, maxDailyActions: 0 },
      logs: [] // Logs usually fetched separately for perf
    }));
  }

  async updateConfig(organizationId: string, botIdOrType: string, config: any, learningConfig?: any) {
    const type = decodeURIComponent(botIdOrType);
    
    // Check by ID or Type
    const bot = await prisma.botConfig.findFirst({
      where: { 
        OR: [{ id: botIdOrType }, { type: type }]
      }
    });

    if (!bot) throw new Error('Bot not found');

    const updateData: any = { configJson: config };
    if (learningConfig) updateData.learningConfigJson = learningConfig;

    await prisma.botConfig.update({
      where: { id: bot.id },
      data: updateData
    });

    return this.getBots(organizationId);
  }

  async toggleBot(organizationId: string, botIdOrType: string) {
    const type = decodeURIComponent(botIdOrType);
    const bot = await prisma.botConfig.findFirst({
        where: { OR: [{ id: botIdOrType }, { type: type }] }
    });

    if (!bot) throw new Error('Bot not found');

    await prisma.botConfig.update({
      where: { id: bot.id },
      data: { 
        enabled: !bot.enabled,
        status: !bot.enabled ? 'Idle' : 'Paused'
      }
    });

    return this.getBots(organizationId);
  }

  async runSimulation(organizationId: string, botIdOrType: string) {
    // In Phase 3, this will trigger the Worker via BullMQ
    // For Phase 2, we just log to DB
    const type = decodeURIComponent(botIdOrType);
    return { status: 'queued', message: 'Simulation logic to be implemented in Phase 3' };
  }

  async getActivity(organizationId: string, botIdOrType: string) {
    const type = decodeURIComponent(botIdOrType);
    // Find bot first to get stable ID
    const bot = await prisma.botConfig.findFirst({
        where: { OR: [{ id: botIdOrType }, { type: type }] }
    });
    
    if(!bot) return [];

    // Fetch logs from BotLog table
    return prisma.botLog.findMany({
        where: { botId: bot.id }, // Assuming logs link via ID, not type
        orderBy: { timestamp: 'desc' },
        take: 50
    });
  }
}
