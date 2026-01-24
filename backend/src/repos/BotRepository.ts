
import { PrismaClient, Prisma, BotType } from '@prisma/client';

const prisma = new PrismaClient();

export class BotRepository {
  async findAll() {
    return prisma.bot.findMany({
      orderBy: { type: 'asc' }
    });
  }

  async findByType(type: BotType) {
    return prisma.bot.findUnique({
      where: { type },
    });
  }

  async updateConfig(id: string, config: any, learningConfig?: any) {
    const data: Prisma.BotUpdateInput = {
      configJson: config,
      updatedAt: new Date(),
    };
    if (learningConfig) data.learningConfigJson = learningConfig;

    return prisma.bot.update({
      where: { id },
      data
    });
  }

  async toggleEnabled(id: string, enabled: boolean) {
    return prisma.bot.update({
      where: { id },
      data: { enabled }
    });
  }

  async createAuditLog(actorId: string, action: string, entity: string, entityId: string, metadata: any) {
    // Note: actorId in AuditLog is a string. If it matches a User ID, Prisma can link it, 
    // but if it's a "BotType" string (e.g. "Creator"), the relation won't connect, which is fine for the schema.
    return prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        metadataJson: metadata
      }
    });
  }
  
  async getLogs(botId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: {
        entity: 'Bot',
        entityId: botId
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });
  }
}
