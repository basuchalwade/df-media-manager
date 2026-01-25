
import { mockDb } from '../db/mockDb';
import { v4 as uuidv4 } from 'uuid';

export class BotService {
  async getBots(organizationId: string) {
    return mockDb.bots;
  }

  async updateConfig(organizationId: string, botType: string, config: any, learningConfig?: any) {
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
    bot.activities.unshift({
        id: uuidv4(),
        createdAt: new Date(),
        status: 'SUCCESS',
        message: 'Simulation completed successfully.',
        actionType: 'SIMULATE',
        platform: 'System'
    });
    return { status: 'queued', message: 'Simulation run queued successfully' };
  }

  async getActivity(organizationId: string, botType: string) {
    const type = decodeURIComponent(botType);
    const bot = mockDb.bots.find(b => b.type === type);
    return bot ? bot.activities : [];
  }
}
