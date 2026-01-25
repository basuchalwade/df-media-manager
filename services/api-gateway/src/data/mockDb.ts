
import { v4 as uuidv4 } from 'uuid';

// Types matching Frontend expectations
export interface User { id: string; name: string; email: string; role: string; status: string; connectedAccounts: any; }
export interface Bot { id: string; type: string; enabled: boolean; status: string; intervalMinutes: number; config: any; stats: any; logs: any[]; }
export interface Campaign { id: string; name: string; objective: string; status: string; startDate: string; budget: any; metrics: any; bots: string[]; }
export interface Media { id: string; url: string; type: string; size: number; governance: any; createdAt: string; }
export interface Stats { totalPosts: number; totalReach: number; engagementRate: number; activeBots: number; }

class MockDatabase {
  users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@contentcaster.io',
      role: 'Admin',
      status: 'Active',
      connectedAccounts: { Twitter: { connected: true, handle: '@admin' } }
    }
  ];

  bots: Bot[] = [
    {
      id: 'creator-1',
      type: 'Creator Bot',
      enabled: true,
      status: 'Idle',
      intervalMinutes: 60,
      config: { safetyLevel: 'Moderate', contentTopics: ['Tech'], targetPlatforms: ['Twitter'] },
      stats: { currentDailyActions: 5, maxDailyActions: 20 },
      logs: []
    },
    {
      id: 'engagement-1',
      type: 'Engagement Bot',
      enabled: true,
      status: 'Running',
      intervalMinutes: 30,
      config: { safetyLevel: 'High', replyTone: 'Casual' },
      stats: { currentDailyActions: 42, maxDailyActions: 100 },
      logs: []
    },
    {
      id: 'growth-1',
      type: 'Growth Bot',
      enabled: false,
      status: 'Idle',
      intervalMinutes: 120,
      config: { safetyLevel: 'Conservative', followRate: 5 },
      stats: { currentDailyActions: 0, maxDailyActions: 50 },
      logs: []
    }
  ];

  campaigns: Campaign[] = [
    {
      id: 'c1',
      name: 'Q3 Product Launch',
      objective: 'Reach',
      status: 'Active',
      startDate: new Date().toISOString(),
      budget: { total: 5000, daily: 100, spent: 450, currency: 'USD' },
      metrics: { impressions: 45000, clicks: 1200, conversions: 45, costPerResult: 16.66, roas: 3.2 },
      bots: ['Creator Bot', 'Engagement Bot']
    }
  ];

  media: Media[] = [
    {
      id: 'm1',
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      type: 'image',
      size: 102400,
      governance: { status: 'approved' },
      createdAt: new Date().toISOString()
    }
  ];

  overviewStats: Stats = {
    totalPosts: 142,
    totalReach: 24500,
    engagementRate: 4.2,
    activeBots: 2
  };

  analyticsSummary = {
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
  };
}

export const mockDb = new MockDatabase();
