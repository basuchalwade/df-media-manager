
import { BotRepository } from '../repos/BotRepository';
import { PostRepository } from '../repos/PostRepository';
import { BotType, Platform, PostStatus } from '@prisma/client';

const botRepo = new BotRepository();
const postRepo = new PostRepository();

export class BotExecutorService {
  
  async executeBotCycle(botId: string, botType: BotType) {
    try {
      await botRepo.createAuditLog(
        botType, // actorId
        'CYCLE_START',
        'Bot',
        botId,
        { status: 'STARTED', message: 'Bot waking up for scheduled run.', platform: Platform.X }
      );

      // --- SIMULATED LOGIC ---
      
      if (botType === BotType.Creator) {
        // Mock Content Generation
        await new Promise(r => setTimeout(r, 2000));
        await postRepo.create({
          content: `Automated content generated at ${new Date().toISOString()}`,
          platform: Platform.X,
          status: PostStatus.Draft,
          botId: botId
        });
      }

      await botRepo.createAuditLog(
        botType,
        'CYCLE_COMPLETE',
        'Bot',
        botId,
        { status: 'SUCCESS', message: 'Cycle completed successfully.', platform: Platform.X }
      );

    } catch (e: any) {
      await botRepo.createAuditLog(
        botType,
        'ERROR',
        'Bot',
        botId,
        { status: 'FAILED', message: e.message, error: JSON.stringify(e), platform: Platform.X }
      );
    }
  }
}
