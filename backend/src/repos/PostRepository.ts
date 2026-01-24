
import * as PrismaPkg from '@prisma/client';

const { PrismaClient, PostStatus, Platform } = PrismaPkg as any;
const prisma = new PrismaClient();

export class PostRepository {
  async findAll() {
    return prisma.post.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { media: true } 
    });
  }

  async create(data: { 
    content: string; 
    platform: any; // Platform
    status: any; // PostStatus
    scheduledFor?: string; 
    metricsJson?: any; 
    botId?: string 
  }) {
    return prisma.post.create({
      data: {
        content: data.content,
        // Schema expects Platform[] array
        platforms: [data.platform], 
        status: data.status,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        metricsJson: { ...data.metricsJson, createdByBotId: data.botId },
        botId: data.botId
      }
    });
  }
  
  async updateStatus(id: string, status: any) { // status: PostStatus
    return prisma.post.update({
      where: { id },
      data: { status }
    });
  }
}