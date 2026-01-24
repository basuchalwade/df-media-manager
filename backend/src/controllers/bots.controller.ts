
import { Request, Response } from 'express';
import { BotRepository } from '../repos/BotRepository';
import { queues } from '../jobs/queues';
import { BotType } from '@prisma/client';

const botRepo = new BotRepository();

export const getBots = async (req: Request, res: Response) => {
  const bots = await botRepo.findAll();
  
  // Enrich with logs
  const botsWithLogs = await Promise.all(bots.map(async (bot) => {
    const logs = await botRepo.getLogs(bot.id, 5);
    return {
      ...bot,
      logs: logs.map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        level: (l.metadataJson as any)?.status === 'FAILED' ? 'Error' : 'Info',
        message: (l.metadataJson as any)?.message || l.action
      }))
    };
  }));

  res.json(botsWithLogs);
};

export const updateBot = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  let bot = await botRepo.findByType(id as BotType);
  
  if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
  }

  const updated = await botRepo.updateConfig(bot.id, req.body.config, req.body.learning);
  res.json([updated]); 
};

export const toggleBot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const bot = await botRepo.findByType(id as BotType);
  if (!bot) return res.status(404).json({ error: 'Bot not found' });

  const updated = await botRepo.toggleEnabled(bot.id, !bot.enabled);
  
  if (updated.enabled) {
    queues.botExecution.add('manual-trigger', { botId: bot.id, type: bot.type });
  }

  res.json([updated]);
};

export const runSimulation = async (req: Request, res: Response) => {
  const { botType } = req.body;
  const bot = await botRepo.findByType(botType as BotType);
  
  if (bot) {
    await queues.botExecution.add('simulation-run', { botId: bot.id, type: bot.type });
    res.json({ status: 'queued' });
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};
