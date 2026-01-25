
import { v4 as uuidv4 } from 'uuid';

// Types simplified for DB storage
export const db = {
  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@contentcaster.io',
      role: 'Admin',
      status: 'Active',
      lastActive: 'Just now',
      connectedAccounts: {
        'Twitter': { connected: true, handle: '@admin_cc', lastSync: new Date().toISOString() },
        'LinkedIn': { connected: true, handle: 'Admin User', lastSync: new Date().toISOString() }
      }
    }
  ],
  bots: [
    {
      type: 'Creator Bot',
      enabled: true,
      intervalMinutes: 60,
      status: 'Idle',
      stats: { currentDailyActions: 12, maxDailyActions: 20, consecutiveErrors: 0 },
      config: {
        safetyLevel: 'Moderate',
        contentTopics: ['AI', 'Tech', 'SaaS'],
        targetPlatforms: ['Twitter', 'LinkedIn']
      },
      learning: { enabled: true, strategy: 'Balanced', maxChangePerDay: 10, lockedFields: [] },
      logs: []
    },
    {
      type: 'Engagement Bot',
      enabled: true,
      intervalMinutes: 30,
      status: 'Running',
      stats: { currentDailyActions: 45, maxDailyActions: 100, consecutiveErrors: 0 },
      config: {
        replyToMentions: true,
        maxDailyInteractions: 100
      },
      logs: []
    },
    {
      type: 'Growth Bot',
      enabled: false,
      intervalMinutes: 120,
      status: 'Idle',
      stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 },
      config: {
        growthTags: ['#Tech', '#Startup'],
        followRatePerHour: 5
      },
      logs: []
    },
    {
      type: 'Finder Bot',
      enabled: false,
      intervalMinutes: 240,
      status: 'Idle',
      stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 },
      config: {
        trackKeywords: ['CompetitorA', 'CompetitorB']
      },
      logs: []
    }
  ],
  posts: [
    {
      id: '1',
      content: 'Just launched our new AI features! 🚀 #Tech #AI',
      platforms: ['Twitter', 'LinkedIn'],
      status: 'Published',
      scheduledFor: new Date().toISOString(),
      author: 'User',
      engagement: { likes: 124, shares: 12, comments: 5 }
    },
    {
      id: '2',
      content: 'Behind the scenes at the office today.',
      platforms: ['Instagram'],
      status: 'Scheduled',
      scheduledFor: new Date(Date.now() + 86400000).toISOString(),
      author: 'Creator Bot',
      engagement: { likes: 0, shares: 0, comments: 0 }
    }
  ],
  campaigns: [
    {
      id: 'c1',
      name: 'Q3 Product Launch',
      objective: 'Traffic',
      status: 'Active',
      platforms: ['Twitter', 'LinkedIn'],
      botIds: ['Creator Bot', 'Engagement Bot'],
      startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      budget: { total: 5000, daily: 150, spent: 750, currency: 'USD' },
      metrics: { impressions: 45000, clicks: 1200, conversions: 45, costPerResult: 16.66, roas: 3.2 },
      aiRecommendations: []
    }
  ],
  media: [
    {
      id: 'm1',
      name: 'Launch_Video.mp4',
      type: 'video',
      url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
      size: 15400000,
      createdAt: new Date().toISOString(),
      governance: { status: 'approved', approvedBy: 'Admin' },
      metadata: { width: 1920, height: 1080, duration: 15 },
      usageCount: 1,
      performanceScore: 85,
      performanceTrend: 'up'
    },
    {
      id: 'm2',
      name: 'Team_Photo.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
      size: 2400000,
      createdAt: new Date().toISOString(),
      governance: { status: 'approved' },
      metadata: { width: 1080, height: 1080 },
      usageCount: 2,
      performanceScore: 72,
      performanceTrend: 'stable'
    }
  ],
  settings: {
    demoMode: true,
    geminiApiKey: '',
    general: { language: 'en', dateFormat: 'MM/DD/YYYY' },
    automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
  },
  globalPolicy: {
    emergencyStop: false,
    quietHours: { enabled: true, startTime: '22:00', endTime: '06:00', timezone: 'UTC' }
  }
};
