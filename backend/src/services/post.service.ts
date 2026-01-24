
import { PrismaClient, PostStatus } from '@prisma/client';
import { queues } from '../jobs/queues';

const prisma = new PrismaClient();

export class PostService {

  async findAll(organizationId: string) {
    // Filter by organizationId in future schema
    return prisma.post.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: { media: true } 
    });
  }

  async createPost(organizationId: string, data: any) {
    // 1. Create Record
    const post = await prisma.post.create({
      data: {
        content: data.content,
        platforms: [data.platform], 
        status: data.status || PostStatus.Draft,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
        metricsJson: data.metricsJson || {},
        botId: data.botId
      }
    });

    // 2. Handle Scheduling/Publishing
    if (post.status === PostStatus.Scheduled || post.status === PostStatus.Published) {
      await this.schedulePublishJob(post);
    }

    return post;
  }

  async updateStatus(organizationId: string, postId: string, status: PostStatus) {
    // Add check ownership logic
    return prisma.post.update({
      where: { id: postId },
      data: { status }
    });
  }

  private async schedulePublishJob(post: any) {
    const delay = post.scheduledFor 
      ? new Date(post.scheduledFor).getTime() - Date.now() 
      : 0;
    
    const finalDelay = delay > 0 ? delay : 0;
    
    // Add to BullMQ
    await queues.botExecution.add(
      'publish-post', 
      { postId: post.id }, 
      { delay: finalDelay }
    );
    
    console.log(`[PostService] Scheduled post ${post.id} with ${finalDelay}ms delay`);
  }
}
