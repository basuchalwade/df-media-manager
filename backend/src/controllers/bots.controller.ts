
import { Request, Response } from 'express';
import { BotRepository } from '../repos/BotRepository';
import { queues } from '../jobs/queues';

const botRepo = new BotRepository();

export const getBots = async (req: Request, res: Response) => {
  const bots = await botRepo.findAll();
  res.json(bots);
};

export const updateBot = async (req: Request, res: Response) => {
  const { id } = req.params; // Can be ID or Type
  // Logic to resolve ID from Type if needed
  let bot = await botRepo.findByType(id as any); // Try finding by type Enum
  
  if (!bot) {
      // Logic for UUID check omitted for brevity
      return res.status(404).json({ error: 'Bot not found' });
  }

  const updated = await botRepo.updateConfig(bot.id, req.body.config, req.body.learning);
  res.json([updated]); // Frontend expects array for optimistic update
};

export const toggleBot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const bot = await botRepo.findByType(id as any);
  if (!bot) return res.status(404).json({ error: 'Bot not found' });

  const updated = await botRepo.toggleEnabled(bot.id, !bot.enabled);
  
  if (updated.enabled) {
    // Trigger initial run
    queues.botExecution.add('manual-trigger', { botId: bot.id, type: bot.type });
  }

  res.json([updated]);
};

export const runSimulation = async (req: Request, res: Response) => {
  const { botType } = req.body;
  const bot = await botRepo.findByType(botType);
  
  if (bot) {
    // Enqueue job immediately
    await queues.botExecution.add('simulation-run', { botId: bot.id, type: bot.type });
    res.json({ status: 'queued' });
  } else {
    res.status(404).json({ error: 'Bot not found' });
  }
};
