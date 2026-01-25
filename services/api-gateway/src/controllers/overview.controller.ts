
import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';

export const getOverviewSummary = (req: Request, res: Response) => {
  // Recalculate active bots dynamically
  mockDb.overviewStats.activeBots = mockDb.bots.filter(b => b.enabled).length;
  res.json(mockDb.overviewStats);
};
