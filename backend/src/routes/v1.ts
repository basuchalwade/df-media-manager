
import { Router } from 'express';
import * as AuthController from '../modules/auth/auth.controller';
import * as CampaignController from '../modules/campaign/campaign.controller';
import * as BotController from '../controllers/bots.controller';
import * as PostController from '../controllers/posts.controller';

const router = Router();

// Mock Middleware
const mockMiddleware = (req: any, res: any, next: any) => {
    req.organizationId = 'org-1';
    next();
};

router.post('/auth/login', AuthController.login);

router.get('/campaigns', mockMiddleware, CampaignController.getCampaigns);
router.post('/campaigns', mockMiddleware, CampaignController.createCampaign);

router.get('/bots', mockMiddleware, BotController.getBots);
router.put('/bots/:id', mockMiddleware, BotController.updateBot);
router.patch('/bots/:id/config', mockMiddleware, BotController.updateBot);
router.post('/bots/:id/toggle', mockMiddleware, BotController.toggleBot);
router.post('/bots/:id/simulate', mockMiddleware, BotController.runSimulation);
router.get('/bots/:id/activity', mockMiddleware, BotController.getBotActivity);

router.get('/posts', mockMiddleware, PostController.getPosts);
router.post('/posts', mockMiddleware, PostController.createPost);
router.put('/posts/:id', mockMiddleware, PostController.updatePost);
router.delete('/posts/:id', mockMiddleware, PostController.deletePost);

export default router;
