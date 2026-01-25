
import express from 'express';
import cors from 'cors';
import v1Routes from './routes/v1';
import { mockDb } from './db/mockDb';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api', v1Routes);

// --- Extra Routes not in v1 yet (Mocking for Phase 1 Completeness) ---

// Media
app.get('/api/media', (req, res) => res.json(mockDb.media));
app.post('/api/media/upload', (req, res) => {
    // In memory upload mock
    const newMedia = {
        id: `m-${Date.now()}`,
        url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0', // Mock URL
        type: 'Image',
        size: 500000,
        governanceStatus: 'Pending',
        createdAt: new Date()
    };
    mockDb.media.unshift(newMedia);
    res.json(newMedia);
});
app.delete('/api/media/:id', (req, res) => {
    mockDb.media = mockDb.media.filter(m => m.id !== req.params.id);
    res.json({ success: true });
});
app.post('/api/media/:id/approve', (req, res) => {
    const m = mockDb.media.find(x => x.id === req.params.id);
    if(m) m.governanceStatus = 'Approved';
    res.json(m);
});

// Settings & Users
app.get('/api/settings', (req, res) => {
    res.json({
        demoMode: true,
        geminiApiKey: '',
        general: { language: 'en', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
        workspace: { timezone: 'UTC', defaultTone: 'Professional' },
        notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
        security: { twoFactorEnabled: false, sessionTimeout: '30m' },
        automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
    });
});
app.put('/api/settings', (req, res) => res.json(req.body));

app.get('/api/users', (req, res) => res.json(mockDb.users));
app.get('/api/users/current', (req, res) => res.json(mockDb.users[0])); // Mock current user

// Dashboard Stats
app.get('/api/stats', (req, res) => {
    res.json({
        totalPosts: mockDb.posts.length,
        totalReach: 12500,
        engagementRate: 4.2,
        activeBots: mockDb.bots.filter(b => b.enabled).length
    });
});

// Integrations
app.post('/api/integrations/:platform/toggle', (req, res) => {
    const { platform } = req.params;
    // Mock toggle logic
    res.json({ success: true, platform });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', phase: '1' }));

app.listen(PORT, () => {
  console.log(`🚀 ContentCaster Mock API Server running on port ${PORT}`);
  console.log(`👉 Environment: Phase 1 (In-Memory Database)`);
});
