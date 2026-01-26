
import { Router } from 'express';
import * as AuthController from '../modules/auth/auth.controller';
import * as CampaignController from '../modules/campaign/campaign.controller';
import * as BotController from '../controllers/bots.controller';
import * as PostController from '../controllers/posts.controller';
import * as MediaController from '../controllers/media.controller';
import * as AnalyticsController from '../controllers/analytics.controller';
import * as AiController from '../controllers/ai.controller';
import * as PlatformController from '../controllers/platform.controller';
import { mockDb } from '../data/mockDb';

const router = Router();

// Mock Middleware for Organization Context
const mockMiddleware = (req: any, res: any, next: any) => {
    req.organizationId = 'org-1'; 
    next();
};

// --- Auth ---
router.post('/auth/login', AuthController.login);

// --- PLATFORM & DEBUG ---
router.get('/platforms', mockMiddleware, PlatformController.getPlatforms);
router.get('/debug/state', mockMiddleware, PlatformController.getDebugState);

// --- Integrations (Toggle) ---
router.post('/integrations/:platform/toggle', mockMiddleware, (req, res) => {
    const { platform } = req.params;
    const user = mockDb.users[0];
    if (user) {
        const current = user.connectedAccounts[platform]?.connected || false;
        user.connectedAccounts[platform] = {
            connected: !current,
            handle: !current ? `@${platform.toLowerCase()}_user` : undefined,
            lastSync: !current ? new Date().toISOString() : undefined
        };
    }
    res.json(user);
});

// --- AI Services ---
router.post('/ai/generate', mockMiddleware, AiController.generate);
router.post('/ai/variants', mockMiddleware, AiController.variants);
router.post('/ai/safety', mockMiddleware, AiController.safety);
// New capabilities
router.post('/ai/image/generate', mockMiddleware, AiController.generateImage);
router.post('/ai/image/edit', mockMiddleware, AiController.editImage);
router.post('/ai/video/generate', mockMiddleware, AiController.generateVideo);
router.post('/ai/chat', mockMiddleware, AiController.chat);

// Campaigns
router.get('/campaigns', mockMiddleware, CampaignController.getCampaigns);
router.post('/campaigns', mockMiddleware, CampaignController.createCampaign);

// Bots
router.get('/bots', mockMiddleware, BotController.getBots);
router.put('/bots/:id', mockMiddleware, BotController.updateBot);
router.patch('/bots/:id/config', mockMiddleware, BotController.updateBot);
router.post('/bots/:id/toggle', mockMiddleware, BotController.toggleBot);
router.post('/bots/:id/simulate', mockMiddleware, BotController.runSimulation);
router.get('/bots/:id/activity', mockMiddleware, BotController.getBotActivity);

// Posts
router.get('/posts', mockMiddleware, PostController.getPosts);
router.post('/posts', mockMiddleware, PostController.createPost);
router.put('/posts/:id', mockMiddleware, PostController.updatePost);
router.delete('/posts/:id', mockMiddleware, PostController.deletePost);

// Media
router.get('/media', mockMiddleware, MediaController.getMedia);
router.post('/media/upload', mockMiddleware, MediaController.uploadMedia);

// Analytics
router.get('/analytics', mockMiddleware, AnalyticsController.getAnalyticsSummary);
router.get('/stats', (req, res) => res.json(mockDb.overviewStats));

// Users
router.get('/users', (req, res) => res.json(mockDb.users));
router.get('/users/current', (req, res) => res.json(mockDb.users[0]));

// Settings
router.get('/settings', (req, res) => res.json({
    demoMode: false,
    general: { language: 'en' },
    automation: { globalSafetyLevel: 'Moderate' }
}));

export default router;
