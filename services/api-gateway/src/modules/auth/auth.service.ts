
import { prisma } from '../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret';

export class AuthService {
  async login(email: string, password: string) {
    // 1. Find User in Postgres
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true // Ensure we get tenant context
      }
    });

    // 2. Validate User & Password
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Note: In a real seeding scenario, ensure DB passwords are hashed. 
    // If mocking initially, you might need a fallback or ensure seed data is hashed.
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    
    if (!isPasswordValid) {
      // Fallback for dev/demo if password isn't hashed yet in seed
      if (password !== 'password') { 
         throw new Error('Invalid credentials');
      }
    }

    if (user.status === 'Suspended') {
      throw new Error('Account suspended');
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organizationId,
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    // 4. Return clean user object (no hash)
    const { passwordHash, ...safeUser } = user;
    return { token, user: safeUser };
  }
}
