
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createQueue, QUEUE_NAMES } from './lib/queue';

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

// 2. Bots (Trigger)
app.post('/api/bots/:type/run', async (req, res) => {
  const { type } = req.params;
  let queue;
  
  if (type === 'Engagement Bot') queue = engagementQueue;
  if (type === 'Growth Bot') queue = growthQueue;
  // ... other mappings

  if (queue) {
    await queue.add('run-bot', { botType: type, botId: 'system' });
    res.json({ success: true, message: `Triggered ${type}` });
  } else {
    res.status(400).json({ error: 'Unknown bot type' });
  }
});

// ... (Other CRUD endpoints for Bots, Users, Media would go here matching existing API surface)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
