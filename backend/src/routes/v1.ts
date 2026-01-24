
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireOrganization } from '../middleware/tenant.middleware';

// Controllers
import * as AuthController from '../modules/auth/auth.controller';
import * as CampaignController from '../modules/campaign/campaign.controller';

const router = Router();

// --- Public Routes ---
router.post('/auth/login', AuthController.login);

// --- Protected Routes (Tenant Scoped) ---
router.use(authenticate);
router.use(requireOrganization);

// Campaigns
router.get('/campaigns', CampaignController.getCampaigns);
router.post('/campaigns', CampaignController.createCampaign);

// Bots (Placeholder for implementation)
// router.get('/bots', BotController.getBots);

export default router;
