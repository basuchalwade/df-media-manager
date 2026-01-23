
import express from 'express';
import cors from 'cors';
import * as Prisma from '@prisma/client';
import { createQueue, QUEUE_NAMES } from './lib/queue';
import { seedDefaultBots } from './seed/initBots';
import { BotEngine } from './services/botEngine';

const { PrismaClient } = Prisma as any;

// Queues
const postQueue = createQueue(QUEUE_NAMES.POST_PUBLISH);
const engagementQueue = createQueue(QUEUE_NAMES.ENGAGEMENT);
const growthQueue = createQueue(QUEUE_NAMES.GROWTH);

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

  // Schedule Job if Scheduled
  if (post.status === 'Scheduled' || post.status === 'Published') {
    const delay = new Date(post.scheduledFor).getTime() - Date.now();
    const finalDelay = delay > 0 ? delay : 0;
    
    await postQueue.add('publish-post', { postId: post.id }, { delay: finalDelay });
    console.log(`Scheduled post ${post.id} with ${finalDelay}ms delay`);
  }

  res.json(post);
});

// 2. Bots Config
app.get('/api/bots', async (req, res) => {
  try {
    let bots = await prisma.botConfig.findMany({
      include: {
        // Get recent 5 activities as "logs" for the card view
        activities: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Failsafe: Auto-seed if empty
    if (bots.length === 0) {
      console.log('⚠️ [API] No bots found. Triggering failsafe seed...');
      await seedDefaultBots(prisma);
      bots = await prisma.botConfig.findMany({
        include: {
          activities: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    // Map activities to the "logs" structure expected by frontend
    const mappedBots = bots.map((b: any) => ({
      ...b,
      logs: b.activities.map((a: any) => ({
        id: a.id,
        timestamp: a.createdAt,
        level: a.status === 'FAILED' ? 'Error' : a.status === 'SKIPPED' ? 'Warning' : 'Info',
        message: a.message
      }))
    }));

    res.json(mappedBots);
  } catch (error) {
    console.error("Failed to fetch bots:", error);
    res.status(500).json({ error: "Failed to fetch bot configuration" });
  }
});

// 3. Bot Activity (Specific)
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

// 4. Simulate Bot Cycle
app.post('/api/bots/:type/simulate', async (req, res) => {
  const { type } = req.params;
  console.log(`[API] Triggering simulation for ${type}`);
  try {
    // Fire and forget - client will poll for logs
    BotEngine.executeBotCycle(type);
    
    // Return immediately so client knows it started
    res.json({ message: 'Simulation started' });
  } catch (error) {
    console.error(`[API] Simulation failed for ${type}:`, error);
    res.status(500).json({ error: 'Simulation execution failed' });
  }
});

// 5. Global Activity
app.get('/api/activity/recent', async (req, res) => {
  const activities = await prisma.botActivity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  res.json(activities);
});

app.post('/api/bots/:type/toggle', async (req, res) => {
  const { type } = req.params;
  const bot = await prisma.botConfig.findUnique({ where: { type } });
  if (!bot) return res.status(404).json({ error: 'Bot not found' });

  const updated = await prisma.botConfig.update({
    where: { type },
    data: { 
      enabled: !bot.enabled,
      status: !bot.enabled ? 'Running' : 'Idle' 
    }
  });
  res.json([updated]);
});

app.put('/api/bots/:type', async (req, res) => {
  const { type } = req.params;
  const updates = req.body;

  // Protect ID and Type from being changed
  delete updates.id;
  delete updates.type;
  
  try {
    await prisma.botConfig.update({
        where: { type },
        data: updates
    });
    
    const allBots = await prisma.botConfig.findMany({
        include: { activities: { take: 5, orderBy: { createdAt: 'desc' } } }
    });
    const mapped = allBots.map((b: any) => ({
        ...b,
        logs: b.activities.map((a: any) => ({
            id: a.id,
            timestamp: a.createdAt,
            level: a.status === 'FAILED' ? 'Error' : a.status === 'SKIPPED' ? 'Warning' : 'Info',
            message: a.message
        }))
    }));
    res.json(mapped);
  } catch (e) {
    console.error("Update failed", e);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Initialize and Start
async function startServer() {
  // Run seeds
  try {
    await seedDefaultBots(prisma);
  } catch (e) {
    console.error("Startup seed failed, continuing...", e);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(e => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
