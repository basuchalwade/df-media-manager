
import { PrismaClient, Bot, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class BotRepository {
  async findAll() {
    return prisma.bot.findMany({
      include: {
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { type: 'asc' }
    });
  }

  async findByType(type: any) {
    return prisma.bot.findUnique({
      where: { type },
      include: { learningConfigJson: true } // Access extended config
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

  async logActivity(data: Prisma.BotActivityCreateInput) {
    return prisma.botActivity.create({ data });
  }
  
  async getActivities(botId: string, limit = 50) {
    return prisma.botActivity.findMany({
      where: { botId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
