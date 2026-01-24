
import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Assuming bcrypt is installed

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-unsafe';

export class AuthService {
  
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In a real cutover, validate hash. For dev migration, we might allow plain text temporarily 
    // or assume the seed data has hashes.
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, organizationId: user.organizationId, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return { token, user };
  }

  async refreshToken(userId: string) {
    // Implementation for refresh tokens
  }
}
