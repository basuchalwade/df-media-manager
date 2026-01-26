import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';

export const getAnalyticsSummary = (req: any, res: any) => {
  res.json(mockDb.analyticsSummary);
};