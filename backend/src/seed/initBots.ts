
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
          contentTopics: ['Industry News', 'Tips & Tricks', 'Company Updates', 'Thought Leadership'],
          targetPlatforms: ['Twitter', 'LinkedIn'],
          generationMode: 'AI',
          safetyLevel: 'Moderate',
          workHoursStart: '09:00',
          workHoursEnd: '17:00',
          aiStrategy: {
            creativityLevel: 'Medium',
            brandVoice: 'Professional',
            keywordsToInclude: ['Innovation', 'Growth'],
            topicsToAvoid: ['Politics', 'Religion']
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
          safetyLevel: 'Moderate',
          workHoursStart: '08:00',
          workHoursEnd: '20:00',
          minDelaySeconds: 60,
          maxDelaySeconds: 300
        },
        stats: {
          currentDailyActions: 0,
          maxDailyActions: 50,
          consecutiveErrors: 0
        }
      },
      {
        type: 'Finder Bot',
        enabled: false, 
        status: 'Idle',
        intervalMinutes: 120,
        config: {
          trackKeywords: ['SaaS', 'AI', 'Automation', 'Marketing'],
          trackAccounts: [],
          autoSaveToDrafts: true,
          safetyLevel: 'Conservative',
          workHoursStart: '00:00',
          workHoursEnd: '23:59'
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
          growthTags: ['#Tech', '#Startup', '#Marketing', '#Founder'],
          interactWithCompetitors: false,
          unfollowAfterDays: 7,
          safetyLevel: 'Conservative',
          workHoursStart: '10:00',
          workHoursEnd: '18:00'
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
