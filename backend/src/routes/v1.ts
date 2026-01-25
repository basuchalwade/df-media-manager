
import { Router } from 'express';
import * as AuthController from '../modules/auth/auth.controller';
import * as CampaignController from '../modules/campaign/campaign.controller';
import * as BotController from '../controllers/bots.controller';
import * as PostController from '../controllers/posts.controller';

const router = Router();

// Mock Auth Middleware for Phase 1
const mockMiddleware = (req: any, res: any, next: any) => {
    req.organizationId = 'org-1';
    next();
};

// Auth
router.post('/auth/login', AuthController.login);

// Campaigns
router.get('/campaigns', mockMiddleware, CampaignController.getCampaigns);
router.post('/campaigns', mockMiddleware, CampaignController.createCampaign);

// Bots
router.get('/bots', mockMiddleware, BotController.getBots);
router.put('/bots/:id', mockMiddleware, BotController.updateBot);
router.patch('/bots/:id/config', mockMiddleware, BotController.updateBot);
router.patch('/bots/:id/toggle', mockMiddleware, BotController.toggleBot);
router.post('/bots/:id/simulate', mockMiddleware, BotController.runSimulation);
// Alias for different frontend usage
router.post('/bots/:id/toggle', mockMiddleware, BotController.toggleBot);

// Posts
router.get('/posts', mockMiddleware, PostController.getPosts);
router.post('/posts', mockMiddleware, PostController.createPost);

export default router;
