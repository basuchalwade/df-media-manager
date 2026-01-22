
import * as Prisma from '@prisma/client';

const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();

export const botExecutor = async (job: any) => {
  const { botType } = job.data;
  console.log(`[Worker] Running Bot: ${botType}`);

  // 1. Create Run Record
  const runRecord = await prisma.botRun.create({
    data: {
      botType,
      botId: job.data.botId || 'system',
      status: 'RUNNING'
    }
  });

  try {
    const botConfig = await prisma.botConfig.findUnique({ where: { type: botType } });
    if (!botConfig || !botConfig.enabled) {
      console.log(`[Worker] Bot ${botType} is disabled or missing.`);
      return;
    }

    // 2. Execute Logic based on Bot Type
    // Simulate complex logic
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let logs = (botConfig.logs as any[]) || [];
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level: 'Success',
      message: `Executed automated task successfully via Worker.`
    };
    logs = [newLog, ...logs].slice(0, 50); // Keep last 50

    // 3. Update Stats
    const stats = botConfig.stats as any;
    stats.currentDailyActions = (stats.currentDailyActions || 0) + 1;

    // 4. Save State
    await prisma.botConfig.update({
      where: { type: botType },
      data: {
        lastRun: new Date(),
        logs: logs as any,
        stats: stats as any
      }
    });

    await prisma.botRun.update({
      where: { id: runRecord.id },
      data: { status: 'SUCCESS', finishedAt: new Date() }
    });

    console.log(`[Worker] Bot ${botType} Finished.`);

  } catch (error: any) {
    console.error(`[Worker] Bot ${botType} Failed`, error);
    await prisma.botRun.update({
      where: { id: runRecord.id },
      data: { status: 'FAILED', finishedAt: new Date(), error: error.message }
    });
    throw error;
  }
};
