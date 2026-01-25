
import { Router } from 'express';
import * as Overview from '../controllers/overview.controller';
import * as Campaigns from '../controllers/campaigns.controller';
import * as Bots from '../controllers/bots.controller';
import * as Media from '../controllers/media.controller';
import * as Analytics from '../controllers/analytics.controller';
import { mockDb } from '../data/mockDb';

const router = Router();

// Overview
router.get('/overview/summary', Overview.getOverviewSummary);
router.get('/stats', Overview.getOverviewSummary); // Frontend Compat

// Campaigns
router.get('/campaigns', Campaigns.getCampaigns);
router.post('/campaigns', Campaigns.createCampaign);

// Bots
router.get('/bots', Bots.getBots);
router.post('/bots/:id/toggle', Bots.toggleBot);
router.post('/bots/:id/activity', Bots.logActivity); // For Worker
router.get('/bots/:id/activity', Bots.getActivity);

// Media
router.get('/media', Media.getMedia);
router.post('/media/upload', Media.uploadMedia);

// Analytics
router.get('/analytics/summary', Analytics.getAnalyticsSummary);
router.get('/analytics', Analytics.getAnalyticsSummary); // Frontend Compat

// Auth
router.post('/auth/login', (req, res) => {
    res.json({ token: 'mock-jwt-token', user: mockDb.users[0] });
});

// Users
router.get('/users', (req, res) => res.json(mockDb.users));
router.get('/users/current', (req, res) => res.json(mockDb.users[0]));

// Posts (Mock for Calendar)
router.get('/posts', (req, res) => res.json([])); // Return empty or mock posts if needed

// Settings
router.get('/settings', (req, res) => res.json({
    demoMode: true,
    general: { language: 'en' },
    automation: { globalSafetyLevel: 'Moderate' }
}));

export default router;
