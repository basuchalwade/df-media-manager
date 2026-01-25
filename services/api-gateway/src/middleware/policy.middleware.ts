
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated Policy Engine Cache
const GLOBAL_POLICIES = {
  EMERGENCY_STOP: false,
  QUIET_HOURS_START: 22, // 10 PM
  QUIET_HOURS_END: 6     // 6 AM
};

export interface PolicyContext {
  userId: string;
  organizationId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      policyContext?: PolicyContext;
    }
  }
}

export const policyGateway = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Identity & Context Extraction (Auth Middleware should run before this)
  const user = (req as any).user;
  
  if (!user || !user.organizationId) {
    return res.status(401).json({ error: 'Identity context missing' });
  }

  // 2. Global Safety Checks (Circuit Breakers)
  if (GLOBAL_POLICIES.EMERGENCY_STOP) {
    // Allow read-only GET requests, block mutations
    if (req.method !== 'GET') {
      return res.status(503).json({ error: 'Global Emergency Stop Active. Write actions suspended.' });
    }
  }

  // 3. Quiet Hours Policy (For Automation Endpoints)
  if (req.path.includes('/automation/trigger')) {
    const hour = new Date().getHours();
    if (hour >= GLOBAL_POLICIES.QUIET_HOURS_START || hour < GLOBAL_POLICIES.QUIET_HOURS_END) {
      // Allow admin override via header
      if (req.headers['x-admin-override'] !== 'true') {
        return res.status(429).json({ error: 'Action blocked by Quiet Hours Policy.' });
      }
    }
  }

  // 4. Inject Context for Downstream
  req.policyContext = {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role
  };

  next();
};
