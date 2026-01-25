
import { mockDb } from '../../db/mockDb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'dev-secret-unsafe';

export class AuthService {
  async login(email: string, password: string) {
    const user = mockDb.users.find(u => u.email === email);

    if (!user) {
      // Auto-create if not exists for Phase 1 convenience
      const newUser = {
          id: 'user-' + Date.now(),
          email,
          name: email.split('@')[0],
          role: 'Admin',
          status: 'Active',
          connectedAccounts: {},
          organizationId: 'org-1'
      };
      mockDb.users.push(newUser);
      
      const token = jwt.sign({ userId: newUser.id, organizationId: 'org-1' }, JWT_SECRET, { expiresIn: '8h' });
      return { token, user: newUser };
    }

    const token = jwt.sign({ userId: user.id, organizationId: 'org-1' }, JWT_SECRET, { expiresIn: '8h' });
    return { token, user };
  }
}
