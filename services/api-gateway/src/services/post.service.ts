
import { prisma } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';

export class PostService {
  async findAll(organizationId: string) {
    return prisma.post.findMany({ 
      // where: { organizationId }, // Enable when schema supports
      orderBy: { createdAt: 'desc' },
      include: { media: true } 
    });
  }

  async createPost(organizationId: string, data: any) {
    return prisma.post.create({
      data: {
        content: data.content,
        platforms: data.platforms || [], 
        status: data.status || 'Draft',
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        metricsJson: data.metricsJson || {},
        botId: data.botId,
        // organizationId // Enable when schema supports
      }
    });
  }

  async updatePost(organizationId: string, id: string, data: any) {
    return prisma.post.update({
        where: { id },
        data: {
            content: data.content,
            status: data.status,
            platforms: data.platforms,
            scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null
        }
    });
  }

  async deletePost(organizationId: string, id: string) {
    await prisma.post.delete({ where: { id } });
  }
}
