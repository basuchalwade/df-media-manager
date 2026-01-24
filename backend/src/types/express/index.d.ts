
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      organizationId?: string; // Critical for multi-tenant isolation
      file?: any; // For Multer uploads
    }
  }
}
