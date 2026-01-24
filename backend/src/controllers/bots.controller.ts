
import { Request, Response } from 'express';
import { BotService } from '../services/bot.service';
import { BotOrchestrator } from '../services/orchestrator/botOrchestrator';

const botService = new BotService();

export const getBots = async (req: any, res: any) => {
  try {
    const bots = await botService.getBots(req.organizationId);
    // Map to frontend view model (preserving existing logic)
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
  const { id } = req.params;
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
  const tenantId = req.organizationId || 'system';

  try {
    if (!botType) {
      return res.status(400).json({ error: 'botType is required' });
    }

    // ARCHITECTURE CHANGE: 
    // We do NOT execute logic here. We ask the Orchestrator to queue it.
    const result = await BotOrchestrator.dispatchBotRun(botType, tenantId, 'MANUAL');

    if (!result.success) {
      return res.status(400).json({ error: result.reason });
    }

    res.status(202).json({ 
      status: 'queued', 
      jobId: result.jobId,
      message: `Bot run for ${botType} queued successfully.` 
    });

  } catch (error: any) {
    console.error('Failed to enqueue bot run:', error);
    res.status(500).json({ error: error.message });
  }
};
