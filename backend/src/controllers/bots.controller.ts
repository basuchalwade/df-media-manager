
import { Request, Response } from 'express';
import { BotRepository } from '../repos/BotRepository';
import { queues } from '../jobs/queues';
import * as PrismaPkg from '@prisma/client';

const { BotType } = PrismaPkg as any;

const botRepo = new BotRepository();

export const getBots = async (req: Request, res: Response) => {
  const bots = await botRepo.findAll();
  
  // Enrich with logs from AuditLog table
  const botsWithLogs = await Promise.all(bots.map(async (bot: any) => {
    const logs = await botRepo.getLogs(bot.id, 5);
    
    // Map AuditLog format to the frontend 'BotLogEntry' shape
    const mappedLogs = logs.map((l: any) => {
      const meta = l.metadataJson as any;
      return {
        id: l.id,
        timestamp: l.timestamp,
        // Map status/metadata to log levels
        level: meta?.status === 'FAILED' ? 'Error' : meta?.status === 'WARNING' ? 'Warning' : 'Info',
        message: meta?.message || l.action
      };
    });

    return {
      ...bot,
      logs: mappedLogs
    };
  }));

  res.json(botsWithLogs);
};

export const updateBot = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // 'id' param here refers to BotType in the route URL structure /bots/:type
  let bot = await botRepo.findByType(id as any); // id as BotType
  
  if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
  }

  const updated = await botRepo.updateConfig(bot.id, req.body.config, req.body.learning);
  res.json([updated]); 
};

export const toggleBot = async (req: Request, res: Response) => {
  const { id } = req.params; // 'id' refers to BotType
  const bot = await botRepo.findByType(id as any); // id as BotType
  
  if (!bot) return res.status(404).json({ error: 'Bot not found' });

  const updated = await botRepo.toggleEnabled(bot.id, !bot.enabled);
  
  if (updated.enabled) {
    queues.botExecution.add('manual-trigger', { botId: bot.id, type: bot.type });
  }

  res.json([updated]);
};

export const runSimulation = async (req: Request, res: Response) => {
  const { botType } = req.body;
  const bot = await botRepo.findByType(botType as any); // botType as BotType
  
  if (bot) {
    await queues.botExecution.add('simulation-run', { botId: bot.id, type: bot.type });
    res.json({ status: 'queued' });
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};