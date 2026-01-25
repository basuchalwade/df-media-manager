
import { BotService } from '../services/bot.service';
const botService = new BotService();

export const getBots = async (req: any, res: any) => {
  try {
    const bots = await botService.getBots(req.organizationId);
    res.json(bots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBot = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const updated = await botService.updateConfig(req.organizationId, id, req.body.config, req.body.learning);
    // Return array to match frontend expectation sometimes, or single object
    const bots = await botService.getBots(req.organizationId);
    res.json(bots); 
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const toggleBot = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await botService.toggleBot(req.organizationId, id);
    const bots = await botService.getBots(req.organizationId);
    res.json(bots);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const runSimulation = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const result = await botService.runSimulation(req.organizationId, id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBotActivity = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const activity = await botService.getActivity(req.organizationId, id);
        res.json(activity);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
