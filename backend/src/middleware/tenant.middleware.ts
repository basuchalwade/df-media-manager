
import { Request, Response, NextFunction } from 'express';

/**
 * Tenant Middleware
 * 
 * Ensures that every authenticated request is scoped to a specific Organization.
 * This prevents data leakage between tenants.
 */
export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(403).json({ error: 'Forbidden: User does not belong to an organization' });
  }

  // Set the context for Services to use
  req.organizationId = req.user.organizationId;
  next();
};
