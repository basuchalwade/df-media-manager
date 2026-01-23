
import { PrismaClient, Post, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class PostRepository {
  async findAll() {
    return prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: Prisma.PostCreateInput) {
    return prisma.post.create({ data });
  }
  
  async updateStatus(id: string, status: string) {
    return prisma.post.update({
      where: { id },
      data: { status }
    });
  }
}
