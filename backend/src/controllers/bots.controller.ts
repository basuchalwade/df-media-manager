
import { Request, Response } from 'express';
import { BotService } from '../services/bot.service';

const botService = new BotService();

export const getBots = async (req: any, res: any) => {
  try {
    const bots = await botService.getBots(req.organizationId);
    
    // Map to frontend view model (preserving legacy controller logic for response shape)
    const mapped = bots.map((b: any) => ({
      ...b,
      logs: b.activities.map((a: any) => ({
        id: a.id,
        timestamp: a.createdAt,
        level: a.status === 'FAILED' ? 'Error' : a.status === 'SKIPPED' ? 'Warning' : 'Info',
        message: a.message
      }))
    }));

    res.json(mapped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBot = async (req: any, res: any) => {
  const { id } = req.params; // 'id' here is bot type in route
  try {
    const updated = await botService.updateConfig(req.organizationId, id, req.body.config, req.body.learning);
    res.json([updated]); 
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const toggleBot = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const updated = await botService.toggleBot(req.organizationId, id);
    res.json([updated]);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const runSimulation = async (req: any, res: any) => {
  const { botType } = req.body;
  try {
    const result = await botService.runSimulation(req.organizationId, botType);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
