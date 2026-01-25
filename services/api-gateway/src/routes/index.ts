
import { Router } from 'express';
import { db } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// --- BOTS ---
router.get('/bots', (req, res) => res.json(db.bots));
router.post('/bots/:id/toggle', (req, res) => {
  const bot = db.bots.find(b => b.id === req.params.id);
  if (bot) {
    bot.enabled = !bot.enabled;
    bot.status = bot.enabled ? 'Running' : 'Paused';
  }
  res.json(db.bots);
});
router.post('/bots/:id/activity', (req, res) => {
  // Worker calls this to update stats
  const bot = db.bots.find(b => b.id === req.params.id);
  if (bot) {
    bot.dailyUsage = Math.min(bot.dailyUsage + 1, bot.dailyLimit);
    db.stats.totalPosts++;
    db.stats.totalReach += Math.floor(Math.random() * 100);
  }
  res.json({ success: true });
});

// --- CAMPAIGNS ---
router.get('/campaigns', (req, res) => res.json(db.campaigns));
router.post('/campaigns', (req, res) => {
  const newCampaign = { ...req.body, id: uuidv4(), status: 'Active', progress: 0 };
  db.campaigns.push(newCampaign);
  res.json(newCampaign);
});

// --- POSTS ---
router.get('/posts', (req, res) => res.json(db.posts));
router.post('/posts', (req, res) => {
  const newPost = { ...req.body, id: uuidv4() };
  db.posts.push(newPost);
  res.json(newPost);
});

// --- MEDIA ---
router.get('/media', (req, res) => res.json(db.media));
router.post('/media/upload', (req, res) => {
  const newMedia = { 
    id: uuidv4(), 
    name: 'Uploaded_Asset.jpg', 
    type: 'image' as const, 
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' 
  };
  db.media.push(newMedia);
  res.json(newMedia);
});

// --- STATS ---
router.get('/stats', (req, res) => {
  db.stats.activeBots = db.bots.filter(b => b.enabled).length;
  res.json(db.stats);
});

// --- ANALYTICS ---
router.get('/analytics', (req, res) => {
  res.json({
    summary: { followers: 12500, impressions: 45000, engagement: 3.8 },
    history: [
      { name: 'Mon', value: 4000 },
      { name: 'Tue', value: 3000 },
      { name: 'Wed', value: 2000 },
      { name: 'Thu', value: 2780 },
      { name: 'Fri', value: 1890 },
      { name: 'Sat', value: 2390 },
      { name: 'Sun', value: 3490 },
    ]
  });
});

// --- AUTH ---
router.post('/auth/login', (req, res) => {
  res.json({ token: 'mock-token', user: { id: '1', name: 'Admin', role: 'Admin' } });
});

export default router;
