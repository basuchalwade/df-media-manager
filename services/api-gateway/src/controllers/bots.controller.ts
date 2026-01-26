import { Request, Response } from 'express';
import { mockDb } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';

export const getBots = (req: any, res: any) => {
  res.json(mockDb.bots);
};

export const updateBot = (req: any, res: any) => {
  const { id } = req.params;
  // Find by ID or Type
  const botIndex = mockDb.bots.findIndex(b => b.id === id || b.type === decodeURIComponent(id));
  
  if (botIndex !== -1) {
    mockDb.bots[botIndex] = { ...mockDb.bots[botIndex], ...req.body };
    res.json(mockDb.bots);
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};

export const toggleBot = (req: any, res: any) => {
  const { id } = req.params;
  const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
  
  if (bot) {
    bot.enabled = !bot.enabled;
    bot.status = bot.enabled ? 'Running' : 'Idle';
    res.json(mockDb.bots);
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};

export const runSimulation = (req: any, res: any) => {
  const { id } = req.params;
  const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
  
  if (bot) {
    const activity = {
      id: uuidv4(),
      botType: bot.type,
      actionType: 'SIMULATE',
      platform: 'System',
      status: 'SUCCESS',
      message: 'Simulation triggered manually.',
      createdAt: new Date().toISOString()
    };
    bot.logs.unshift(activity);
    res.json({ status: 'queued', message: 'Simulation run queued successfully' });
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};

export const logActivity = (req: any, res: any) => {
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

export const getBotActivity = (req: any, res: any) => {
    const { id } = req.params;
    const bot = mockDb.bots.find(b => b.id === id) || mockDb.bots.find(b => b.type === decodeURIComponent(id));
    res.json(bot ? bot.logs : []);
};