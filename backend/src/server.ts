
import express from 'express';
import cors from 'cors';
import * as Prisma from '@prisma/client';
import { seedDefaultBots } from './seed/initBots';

// Import Infrastructure
import { botWorker } from './workers/bot.worker'; // Importing starts the worker listener
import { botScheduler } from './scheduler/bot.scheduler';

const { PrismaClient } = Prisma as any;
const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json() as any);

// --- Routes ---

// 1. Posts
app.get('/api/posts', async (req, res) => {
  const posts = await prisma.post.findMany({ orderBy: { scheduledFor: 'desc' } });
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  const post = await prisma.post.create({
    data: {
      ...req.body,
      status: req.body.status || 'Draft',
    }
  });
  // Note: Post scheduling queue logic would go here in P4
  res.json(post);
});

// 2. Bots Config
import { getBots, updateBot, toggleBot, runSimulation } from './controllers/bots.controller';

const mockAuth = (req: any, res: any, next: any) => {
  req.organizationId = 'system-tenant';
  next();
};

app.get('/api/bots', mockAuth, getBots);
app.get('/api/bots/:type/activity', async (req, res) => {
  const { type } = req.params;
  const { limit = 100 } = req.query;
  const activities = await prisma.botActivity.findMany({
    where: { botType: type },
    orderBy: { createdAt: 'desc' },
    take: Number(limit)
  });
  res.json(activities);
});
app.post('/api/bots/:type/simulate', mockAuth, runSimulation);
app.post('/api/bots/:type/toggle', mockAuth, toggleBot);
app.put('/api/bots/:id', mockAuth, updateBot);

// 5. Global Activity
app.get('/api/activity/recent', async (req, res) => {
  const activities = await prisma.botActivity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(activities);
});

// Initialize and Start
async function startServer() {
  try {
    await seedDefaultBots(prisma);
  } catch (e) {
    console.error("Startup seed failed, continuing...", e);
  }

  // START BACKGROUND SERVICES
  console.log('🚀 Starting Background Services...');
  
  if (botWorker) {
    console.log('✅ Bot Worker: Listening for jobs');
  }
  
  if (botScheduler) {
    botScheduler.start();
    console.log('✅ Scheduler: Active');
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(e => {
  console.error("Failed to start server:", e);
  (process as any).exit(1);
});
