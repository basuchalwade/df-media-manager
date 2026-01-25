
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Mock Auth: Accept any Bearer token or skip check for dev
  const authHeader = req.headers.authorization;
  if (!authHeader && !req.path.includes('/auth/login')) {
    // For Phase 1B dev simplicity, we warn but allow, or require token
    // res.status(401).json({ error: 'No token provided' });
    // return; 
  }
  next();
};
