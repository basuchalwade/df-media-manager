
import { BotRepository } from '../repos/BotRepository';
import { PostRepository } from '../repos/PostRepository';
import { BotType, Platform, PostStatus } from '@prisma/client';

const botRepo = new BotRepository();
const postRepo = new PostRepository();

export class BotExecutorService {
  
  async executeBotCycle(botId: string, botType: BotType) {
    try {
      // Log Start
      await botRepo.createAuditLog(
        botType, // Use BotType string as actorId
        'CYCLE_START',
        'Bot',
        botId,
        { status: 'STARTED', message: 'Bot waking up for scheduled run.' }
      );

      // --- SIMULATED LOGIC ---
      
      if (botType === BotType.Creator) {
        // Mock Content Generation
        await new Promise(r => setTimeout(r, 2000));
        
        // Ensure platform is mapped to valid Enum (X, not Twitter)
        const targetPlatform = Platform.X; 

        await postRepo.create({
          content: `Automated content generated at ${new Date().toISOString()}`,
          platform: targetPlatform, 
          status: PostStatus.Draft,
          botId: botId
        });
      }

      // Log Success
      await botRepo.createAuditLog(
        botType,
        'CYCLE_COMPLETE',
        'Bot',
        botId,
        { status: 'SUCCESS', message: 'Cycle completed successfully.' }
      );

    } catch (e: any) {
      // Log Failure
      await botRepo.createAuditLog(
        botType,
        'ERROR',
        'Bot',
        botId,
        { status: 'FAILED', message: e.message, error: JSON.stringify(e) }
      );
    }
  }
}
