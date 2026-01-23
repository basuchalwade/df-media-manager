import * as Prisma from '@prisma/client';

export const seedDefaultBots = async (prisma: any) => {
  try {
    const count = await prisma.botConfig.count();
    
    if (count > 0) {
      console.log('✅ [Seed] Bots already exist. Skipping initialization.');
      return;
    }

    console.log('🌱 [Seed] Initializing default bots...');

    const bots = [
      {
        type: 'Creator Bot',
        enabled: true,
        status: 'Idle',
        intervalMinutes: 60,
        config: {
          contentTopics: ['Industry News', 'Tips & Tricks', 'Company Updates'],
          targetPlatforms: ['Twitter', 'LinkedIn'],
          generationMode: 'AI',
          aiStrategy: {
            creativityLevel: 'Medium',
            brandVoice: 'Professional',
            keywordsToInclude: [],
            topicsToAvoid: []
          }
        },
        stats: {
          currentDailyActions: 0,
          maxDailyActions: 10,
          consecutiveErrors: 0
        }
      },
      {
        type: 'Engagement Bot',
        enabled: true,
        status: 'Idle',
        intervalMinutes: 30,
        config: {
          replyToMentions: true,
          replyToComments: true,
          maxDailyInteractions: 50,
          safetyLevel: 'Moderate'
        },
        stats: {
          currentDailyActions: 0,
          maxDailyActions: 50,
          consecutiveErrors: 0
        }
      },
      {
        type: 'Finder Bot',
        enabled: false, // Default to disabled to let user configure keywords first
        status: 'Idle',
        intervalMinutes: 120,
        config: {
          trackKeywords: ['SaaS', 'AI', 'Automation'],
          trackAccounts: [],
          autoSaveToDrafts: true
        },
        stats: {
          currentDailyActions: 0,
          maxDailyActions: 100,
          consecutiveErrors: 0
        }
      },
      {
        type: 'Growth Bot',
        enabled: false,
        status: 'Idle',
        intervalMinutes: 240,
        config: {
          growthTags: ['#Tech', '#Startup', '#Marketing'],
          interactWithCompetitors: false,
          unfollowAfterDays: 7,
          safetyLevel: 'Conservative'
        },
        stats: {
          currentDailyActions: 0,
          maxDailyActions: 25,
          consecutiveErrors: 0
        }
      }
    ];

    for (const bot of bots) {
      await prisma.botConfig.create({
        data: bot
      });
    }

    console.log('✅ [Seed] Successfully created 4 default bots.');

  } catch (error) {
    console.error('❌ [Seed] Failed to seed bots:', error);
  }
};