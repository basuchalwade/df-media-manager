
import { PrismaClient, BotType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_BOT_CONFIG = {
  safetyLevel: 'Moderate',
  workHoursStart: '09:00',
  workHoursEnd: '17:00'
};

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@contentcaster.io' },
    update: {},
    create: {
      email: 'admin@contentcaster.io',
      name: 'Admin User',
      password: 'hashed_password_here', // In prod use bcrypt
      role: 'Admin'
    }
  });

  // 2. Create Bots
  const bots = [
    { type: BotType.Creator, config: { ...DEFAULT_BOT_CONFIG, contentTopics: ['Tech'] } },
    { type: BotType.Engagement, config: { ...DEFAULT_BOT_CONFIG, replyTone: 'Casual' } },
    { type: BotType.Finder, config: { ...DEFAULT_BOT_CONFIG, trackKeywords: ['AI'] } },
    { type: BotType.Growth, config: { ...DEFAULT_BOT_CONFIG, followRate: 10 } }
  ];

  for (const bot of bots) {
    await prisma.bot.upsert({
      where: { type: bot.type },
      update: {},
      create: {
        type: bot.type,
        configJson: bot.config,
        enabled: false,
        intervalMinutes: 60
      }
    });
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
