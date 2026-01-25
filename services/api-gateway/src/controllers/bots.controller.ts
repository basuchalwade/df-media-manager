
import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';

export const getBots = (req: Request, res: Response) => {
  res.json(mockDb.bots);
};

export const toggleBot = (req: Request, res: Response) => {
  const { id } = req.params;
  // Try finding by ID first, then by Type (frontend compatibility)
  const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
  
  if (bot) {
    bot.enabled = !bot.enabled;
    bot.status = bot.enabled ? 'Running' : 'Idle';
    res.json(mockDb.bots);
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};

export const logActivity = (req: Request, res: Response) => {
  const { id } = req.params;
  const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
  
  if (bot) {
    const activity = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    bot.logs.unshift(activity);
    if (bot.logs.length > 50) bot.logs.pop();
    
    // Increment stats if success
    if (req.body.status === 'SUCCESS') {
        bot.stats.currentDailyActions = (bot.stats.currentDailyActions || 0) + 1;
    }
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};

export const getActivity = (req: Request, res: Response) => {
    const { id } = req.params;
    const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
    res.json(bot ? bot.logs : []);
};
