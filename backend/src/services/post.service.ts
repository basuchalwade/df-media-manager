
import { PostStatus } from '@prisma/client';
import { mockDb } from '../db/mockDb';
import { v4 as uuidv4 } from 'uuid';

export class PostService {

  async findAll(organizationId: string) {
    return mockDb.posts;
  }

  async createPost(organizationId: string, data: any) {
    const newPost = {
      id: uuidv4(),
      content: data.content,
      platforms: [data.platform], 
      status: data.status || 'Draft',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      createdAt: new Date(),
      metricsJson: data.metricsJson || {},
      botId: data.botId
    };
    
    mockDb.posts.unshift(newPost);
    return newPost;
  }

  async updateStatus(organizationId: string, postId: string, status: any) {
    const post = mockDb.posts.find(p => p.id === postId);
    if (post) post.status = status;
    return post;
  }
}
