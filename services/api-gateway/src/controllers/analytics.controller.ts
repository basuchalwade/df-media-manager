
import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';

export const getAnalyticsSummary = (req: Request, res: Response) => {
  res.json(mockDb.analyticsSummary);
};
