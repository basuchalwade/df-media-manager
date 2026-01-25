
import { mockDb } from '../db/mockDb';
import { v4 as uuidv4 } from 'uuid';

export class BotService {

  async getBots(organizationId: string) {
    return mockDb.bots;
  }

  async updateConfig(organizationId: string, botType: string, config: any, learningConfig?: any) {
    // Decode if encoded (frontend sometimes sends encoded ID)
    const type = decodeURIComponent(botType);
    const bot = mockDb.bots.find(b => b.type === type);
    if (!bot) throw new Error('Bot not found');

    bot.configJson = config;
    if (learningConfig) bot.learningConfigJson = learningConfig;
    
    return bot;
  }

  async toggleBot(organizationId: string, botType: string) {
    const type = decodeURIComponent(botType);
    const bot = mockDb.bots.find(b => b.type === type);
    if (!bot) throw new Error('Bot not found');

    bot.enabled = !bot.enabled;
    bot.status = bot.enabled ? 'Running' : 'Idle';
    return bot;
  }

  async runSimulation(organizationId: string, botType: string) {
    const type = decodeURIComponent(botType);
    const bot = mockDb.bots.find(b => b.type === type);
    if (!bot) throw new Error('Bot not found');

    // Add fake activity log
    bot.activities.unshift({
        id: uuidv4(),
        createdAt: new Date(),
        status: 'SUCCESS',
        message: 'Simulation completed successfully.'
    });

    return { status: 'queued', message: 'Simulation run queued successfully' };
  }
}
