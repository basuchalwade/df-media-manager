import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';

export const getCampaigns = (req: any, res: any) => {
  res.json(mockDb.campaigns);
};

export const createCampaign = (req: any, res: any) => {
  const newCampaign = {
    ...req.body,
    id: uuidv4(),
    status: 'Active',
    metrics: { impressions: 0, clicks: 0, conversions: 0, costPerResult: 0, roas: 0 }
  };
  mockDb.campaigns.unshift(newCampaign);
  res.status(201).json(newCampaign);
};