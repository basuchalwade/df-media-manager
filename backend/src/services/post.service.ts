
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
      platforms: data.platforms || [], 
      status: data.status || 'Draft',
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
      createdAt: new Date(),
      metricsJson: data.metricsJson || {},
      botId: data.botId
    };
    mockDb.posts.unshift(newPost);
    return newPost;
  }

  async updatePost(organizationId: string, id: string, data: any) {
    const idx = mockDb.posts.findIndex(p => p.id === id);
    if (idx !== -1) {
        mockDb.posts[idx] = { ...mockDb.posts[idx], ...data };
        return mockDb.posts[idx];
    }
    throw new Error('Post not found');
  }

  async deletePost(organizationId: string, id: string) {
    mockDb.posts = mockDb.posts.filter(p => p.id !== id);
  }
}
