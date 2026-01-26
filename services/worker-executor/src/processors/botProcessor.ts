
import { Job } from 'bullmq';
import { prisma } from '../lib/db';
import { WorkerAiService } from '../lib/ai';
import { v4 as uuidv4 } from 'uuid';

const aiService = new WorkerAiService();

export const botProcessor = async (job: Job) => {
  const { botId } = job.data;
  console.log(`[Worker] 🤖 Processing Bot: ${botId}`);

  try {
    // 1. Fetch Fresh Config
    const bot = await prisma.botConfig.findUnique({ where: { id: botId } });
    if (!bot || !bot.enabled) {
      console.log(`[Worker] Bot ${botId} disabled or missing. Skipping.`);
      return;
    }

    // Update Status to Running
    await prisma.botConfig.update({
      where: { id: botId },
      data: { status: 'Running' }
    });

    const config = bot.configJson as any || {};
    let activityMessage = '';
    let actionType = 'ANALYZE';

    // 2. Execute Specific Logic
    switch (bot.type) {
      case 'Creator Bot':
        actionType = 'POST';
        const topics = config.contentTopics || ['Tech', 'Innovation'];
        const platform = (config.targetPlatforms && config.targetPlatforms[0]) || 'Twitter';
        
        // Generate Content
        const content = await aiService.generateDraft(topics, platform);
        
        // Save to Database as Draft
        await prisma.post.create({
          data: {
            content: content,
            platforms: [platform],
            status: 'Draft',
            botId: bot.id,
            metricsJson: { source: 'Creator Bot Auto-Gen' }
          }
        });
        activityMessage = `Drafted new content about "${topics[0]}" for ${platform}`;
        break;

      case 'Engagement Bot':
        actionType = 'REPLY';
        // Simulate finding a mention
        await new Promise(r => setTimeout(r, 1500)); // Fake processing time
        activityMessage = `Analyzed 15 mentions. Replied to @user_${Math.floor(Math.random()*1000)}.`;
        break;

      case 'Growth Bot':
        actionType = 'FOLLOW';
        // Simulate growth actions
        await new Promise(r => setTimeout(r, 1000));
        activityMessage = `Followed 3 new accounts in target niche "${config.growthTags?.[0] || 'General'}".`;
        break;

      case 'Finder Bot':
        actionType = 'ANALYZE';
        await new Promise(r => setTimeout(r, 2000));
        activityMessage = `Scanned 50 keywords. Found 2 potential leads.`;
        break;
    }

    // 3. Log Activity
    const logEntry = {
      id: uuidv4(),
      botType: bot.type,
      actionType,
      platform: 'System',
      status: 'SUCCESS',
      message: activityMessage,
      createdAt: new Date().toISOString()
    };

    // Update Bot State (Logs & Stats)
    const currentLogs = (bot.logsJson as any[]) || [];
    const newLogs = [logEntry, ...currentLogs].slice(0, 50); // Keep last 50

    const currentStats = (bot.statsJson as any) || {};
    const newStats = {
      ...currentStats,
      currentDailyActions: (currentStats.currentDailyActions || 0) + 1
    };

    await prisma.botConfig.update({
      where: { id: botId },
      data: {
        lastRun: new Date(),
        status: 'Idle',
        logsJson: newLogs,
        statsJson: newStats
      }
    });

    console.log(`[Worker] ✅ ${bot.type} Cycle Complete: ${activityMessage}`);

  } catch (error) {
    console.error(`[Worker] ❌ Error processing bot ${botId}:`, error);
    
    await prisma.botConfig.update({
      where: { id: botId },
      data: { status: 'Error' }
    });
  }
};
