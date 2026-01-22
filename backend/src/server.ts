
import express from 'express';
import cors from 'cors';
import * as Prisma from '@prisma/client';
import { createQueue, QUEUE_NAMES } from './lib/queue';

const { PrismaClient } = Prisma as any;

// Queues
const postQueue = createQueue(QUEUE_NAMES.POST_PUBLISH);
const engagementQueue = createQueue(QUEUE_NAMES.ENGAGEMENT);
const growthQueue = createQueue(QUEUE_NAMES.GROWTH);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

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
  const bots = await prisma.botConfig.findMany({
    include: {
      // Get recent 5 activities as "logs" for the card view
      activities: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  // Map activities to the "logs" structure expected by frontend
  const mappedBots = bots.map(b => ({
    ...b,
    logs: b.activities.map(a => ({
      id: a.id,
      timestamp: a.createdAt,
      level: a.status === 'FAILED' ? 'Error' : a.status === 'SKIPPED' ? 'Warning' : 'Info',
      message: a.message
    }))
  }));

  res.json(mappedBots);
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

// 4. Global Activity
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
