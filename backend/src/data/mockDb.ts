
import { v4 as uuidv4 } from 'uuid';

export interface User { id: string; name: string; email: string; role: string; status: string; connectedAccounts: any; }
export interface Bot { id: string; type: string; enabled: boolean; status: string; intervalMinutes: number; config: any; stats: any; logs: any[]; }
export interface Campaign { id: string; name: string; objective: string; status: string; startDate: string; budget: any; metrics: any; bots: string[]; }
export interface Media { id: string; url: string; type: string; size: number; governance: any; createdAt: string; }
export interface Stats { totalPosts: number; totalReach: number; engagementRate: number; activeBots: number; }

// --- SINGLE SOURCE OF TRUTH ---
export const PLATFORM_REGISTRY = [
  {
    id: 'Twitter',
    name: 'X (Twitter)',
    enabled: true, // System-wide switch
    outage: false, // API Status
    supports: { POST: true, LIKE: true, FOLLOW: true, REPLY: true },
    rateLimits: { POST: 50, LIKE: 100, FOLLOW: 20, REPLY: 50 },
    validation: { charLimit: 280, mediaRequired: false, maxMediaSizeMB: 512, aspectRatioRanges: [[0.5, 2.0]] },
    ui: { color: 'bg-black text-white', borderColor: 'border-black', iconColor: 'text-black' }
  },
  {
    id: 'LinkedIn',
    name: 'LinkedIn',
    enabled: true,
    outage: false,
    supports: { POST: true, LIKE: true, FOLLOW: false, REPLY: true },
    rateLimits: { POST: 10, LIKE: 50, REPLY: 20 },
    validation: { charLimit: 3000, mediaRequired: false, maxMediaSizeMB: 200, aspectRatioRanges: [[0.5, 2.4]] },
    ui: { color: 'bg-[#0077b5] text-white', borderColor: 'border-[#0077b5]', iconColor: 'text-[#0077b5]' }
  },
  {
    id: 'Instagram',
    name: 'Instagram',
    enabled: true,
    outage: false,
    supports: { POST: true, LIKE: true, FOLLOW: true, REPLY: true },
    rateLimits: { POST: 15, LIKE: 100, FOLLOW: 50 },
    validation: { charLimit: 2200, mediaRequired: true, maxMediaSizeMB: 100, aspectRatioRanges: [[0.8, 1.91]] },
    ui: { color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white', borderColor: 'border-pink-500', iconColor: 'text-pink-600' }
  },
  {
    id: 'Facebook',
    name: 'Facebook',
    enabled: true,
    outage: false,
    supports: { POST: true, LIKE: true, REPLY: true },
    rateLimits: { POST: 25, LIKE: 100 },
    validation: { charLimit: 63206, mediaRequired: false, maxMediaSizeMB: 512, aspectRatioRanges: [[0.5, 2.0]] },
    ui: { color: 'bg-[#1877F2] text-white', borderColor: 'border-[#1877F2]', iconColor: 'text-blue-600' }
  },
  {
    id: 'YouTube',
    name: 'YouTube',
    enabled: true,
    outage: false,
    supports: { POST: true, LIKE: true, REPLY: true },
    rateLimits: { POST: 5, LIKE: 50 },
    validation: { charLimit: 5000, videoRequired: true, maxMediaSizeMB: 2048, aspectRatioRanges: [[1.7, 1.8]] },
    ui: { color: 'bg-[#FF0000] text-white', borderColor: 'border-[#FF0000]', iconColor: 'text-red-600' }
  },
  {
    id: 'Google Business',
    name: 'Google Business',
    enabled: true,
    outage: false,
    supports: { POST: true, REPLY: true },
    rateLimits: { POST: 10, REPLY: 20 },
    validation: { charLimit: 1500, mediaRequired: false, maxMediaSizeMB: 75, aspectRatioRanges: [[1.0, 1.5]] },
    ui: { color: 'bg-[#4285F4] text-white', borderColor: 'border-[#4285F4]', iconColor: 'text-blue-600' }
  },
  {
    id: 'Threads',
    name: 'Threads',
    enabled: true,
    outage: false,
    supports: { POST: true, LIKE: true, REPLY: true },
    rateLimits: { POST: 30, LIKE: 100 },
    validation: { charLimit: 500, mediaRequired: false, maxMediaSizeMB: 100, aspectRatioRanges: [[0.5, 2.0]] },
    ui: { color: 'bg-black text-white', borderColor: 'border-black', iconColor: 'text-slate-900' }
  }
];

class MockDatabase {
  users: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@contentcaster.io',
      role: 'Admin',
      status: 'Active',
      // Default connections
      connectedAccounts: { 
        Twitter: { connected: true, handle: '@admin' },
        LinkedIn: { connected: true, handle: '@admin_pro' } // Initially connected
      }
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
