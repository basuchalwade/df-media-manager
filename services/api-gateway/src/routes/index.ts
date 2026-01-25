
import { Router } from 'express';
import { db } from '../data/mockDb';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- AUTH ---
router.post('/auth/login', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: db.users[0] });
});

// --- DASHBOARD ---
router.get('/stats', (req, res) => {
  res.json({
    totalPosts: db.posts.length,
    totalReach: 12500 + Math.floor(Math.random() * 1000),
    engagementRate: 4.2,
    activeBots: db.bots.filter(b => b.enabled).length
  });
});

router.get('/analytics', (req, res) => {
  // Mock Analytics Data
  res.json({
    platform: 'All',
    summary: { 
        followers: 12500, followersGrowth: 2.5, 
        impressions: 45000, impressionsGrowth: 12.5, 
        engagementRate: 3.8, engagementGrowth: 1.2 
    },
    history: Array.from({length: 7}, (_, i) => ({ 
        date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(), 
        followers: 1200 + i*10, 
        impressions: 4000 + Math.random()*1000, 
        engagement: 200 + Math.random()*50 
    }))
  });
});

// --- BOTS ---
router.get('/bots', (req, res) => res.json(db.bots));

router.post('/bots/:id/toggle', (req, res) => {
  const bot = db.bots.find(b => b.type === decodeURIComponent(req.params.id));
  if (bot) {
    bot.enabled = !bot.enabled;
    bot.status = bot.enabled ? 'Running' : 'Idle';
  }
  res.json(db.bots);
});

router.put('/bots/:id', (req, res) => {
  const idx = db.bots.findIndex(b => b.type === decodeURIComponent(req.params.id));
  if (idx !== -1) {
    db.bots[idx] = { ...db.bots[idx], ...req.body };
  }
  res.json(db.bots);
});

router.get('/bots/:id/activity', (req, res) => {
  const bot = db.bots.find(b => b.type === decodeURIComponent(req.params.id));
  res.json(bot ? bot.logs : []);
});

router.post('/bots/:id/activity', (req, res) => {
  // Endpoint for Worker to push logs
  const bot = db.bots.find(b => b.type === decodeURIComponent(req.params.id));
  if (bot) {
      if (!bot.logs) bot.logs = [];
      bot.logs.unshift({ ...req.body, id: uuidv4(), createdAt: new Date().toISOString() });
      if (bot.logs.length > 50) bot.logs.pop();
      if (req.body.status === 'SUCCESS') bot.stats.currentDailyActions++;
  }
  res.json({ success: true });
});

// --- CAMPAIGNS ---
router.get('/campaigns', (req, res) => res.json(db.campaigns));

router.post('/campaigns', (req, res) => {
  const newCamp = { 
      ...req.body, 
      id: uuidv4(), 
      status: 'Active', 
      metrics: { impressions: 0, clicks: 0, conversions: 0, costPerResult: 0, roas: 0 },
      aiRecommendations: []
  };
  db.campaigns.unshift(newCamp);
  res.json(newCamp);
});

// --- POSTS ---
router.get('/posts', (req, res) => res.json(db.posts));

router.post('/posts', (req, res) => {
  const newPost = { ...req.body, id: uuidv4(), createdAt: new Date().toISOString() };
  db.posts.unshift(newPost);
  res.json(newPost);
});

router.put('/posts/:id', (req, res) => {
  const idx = db.posts.findIndex(p => p.id === req.params.id);
  if (idx !== -1) {
    db.posts[idx] = { ...db.posts[idx], ...req.body };
    res.json(db.posts[idx]);
  } else res.status(404).json({ error: 'Not found' });
});

router.delete('/posts/:id', (req, res) => {
  db.posts = db.posts.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// --- MEDIA ---
router.get('/media', (req, res) => res.json(db.media));

router.post('/media/upload', upload.single('file'), (req, res) => {
  // In a real app, upload to S3 here.
  const newMedia = {
    id: uuidv4(),
    name: req.file?.originalname || 'Uploaded Asset',
    type: req.file?.mimetype.startsWith('video') ? 'video' : 'image',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0', // Mock URL
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    size: req.file?.size || 1024,
    createdAt: new Date().toISOString(),
    governance: { status: 'pending' },
    metadata: { width: 1080, height: 1080 },
    variants: []
  };
  db.media.unshift(newMedia as any);
  res.json(newMedia);
});

router.delete('/media/:id', (req, res) => {
  db.media = db.media.filter(m => m.id !== req.params.id);
  res.json(db.media);
});

// --- SETTINGS ---
router.get('/settings', (req, res) => res.json(db.settings));
router.put('/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  res.json(db.settings);
});

// --- USERS ---
router.get('/users', (req, res) => res.json(db.users));
router.get('/users/current', (req, res) => res.json(db.users[0]));
router.post('/integrations/:platform/toggle', (req, res) => {
    const user = db.users[0];
    const platform = req.params.platform;
    const isConnected = !!user.connectedAccounts[platform]?.connected;
    
    user.connectedAccounts[platform] = {
        connected: !isConnected,
        handle: !isConnected ? `@demo_${platform}` : undefined,
        lastSync: new Date().toISOString()
    };
    res.json(user);
});

export default router;
