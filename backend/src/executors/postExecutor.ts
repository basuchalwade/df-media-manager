
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const postExecutor = async (job: any) => {
  const { postId } = job.data;
  console.log(`[Worker] Publishing Post ${postId}...`);

  try {
    // 1. Update status to Processing
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'Processing' }
    });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");

    // 2. Simulate Network Latency / API Call
    // In production, this would switch (post.platform) and call Twitter/LinkedIn APIs
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Success Update
    await prisma.post.update({
      where: { id: postId },
      data: { 
        status: 'Published',
        updatedAt: new Date()
      }
    });
    
    // 4. Update JobQueue status in DB
    // (BullMQ does this for Redis, but we keep DB sync for UI history)
    
    console.log(`[Worker] Post ${postId} Published Successfully`);
  } catch (error) {
    console.error(`[Worker] Failed to publish ${postId}`, error);
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'Failed' }
    });
    throw error;
  }
};
