
import { BotType, Platform, CampaignStatus, UserRole, UserStatus } from '@prisma/client';

// Types mimicking Prisma Client
export interface MockUser { id: string; email: string; name: string; role: any; status: any; connectedAccounts: any; organizationId?: string; }
export interface MockBot { id: string; type: string; enabled: boolean; status: string; intervalMinutes: number; configJson: any; statsJson: any; learningConfigJson?: any; activities: any[]; }
export interface MockPost { id: string; content: string; platforms: string[]; status: string; scheduledFor?: Date; createdAt: Date; }
export interface MockCampaign { id: string; name: string; objective: string; status: string; startDate: Date; budgetConfig: any; bots: any[]; }
export interface MockMedia { id: string; url: string; type: string; size: number; governanceStatus: string; createdAt: Date; }

class MockDatabase {
  users: MockUser[] = [
    {
      id: '1',
      email: 'admin@contentcaster.io',
      name: 'Admin User',
      role: 'Admin',
      status: 'Active',
      connectedAccounts: { Twitter: { connected: true, handle: '@admin' } },
      organizationId: 'org-1'
    }
  ];

  bots: MockBot[] = [
    {
      id: '1', type: 'Creator Bot', enabled: true, status: 'Idle', intervalMinutes: 60,
      configJson: { safetyLevel: 'Moderate', contentTopics: ['Tech'], targetPlatforms: ['Twitter'] },
      statsJson: { currentDailyActions: 5, maxDailyActions: 20 },
      activities: []
    },
    {
      id: '2', type: 'Engagement Bot', enabled: true, status: 'Running', intervalMinutes: 30,
      configJson: { safetyLevel: 'High', replyTone: 'Casual' },
      statsJson: { currentDailyActions: 42, maxDailyActions: 100 },
      activities: []
    },
    {
      id: '3', type: 'Growth Bot', enabled: false, status: 'Idle', intervalMinutes: 120,
      configJson: { safetyLevel: 'Conservative', followRate: 5 },
      statsJson: { currentDailyActions: 0, maxDailyActions: 50 },
      activities: []
    },
    {
      id: '4', type: 'Finder Bot', enabled: false, status: 'Idle', intervalMinutes: 240,
      configJson: { keywords: ['SaaS'] },
      statsJson: { currentDailyActions: 0, maxDailyActions: 50 },
      activities: []
    }
  ];

  posts: MockPost[] = [
    {
      id: '1',
      content: 'Hello World from ContentCaster API!',
      platforms: ['Twitter'],
      status: 'Published',
      createdAt: new Date(),
      scheduledFor: new Date()
    }
  ];

  campaigns: MockCampaign[] = [
    {
      id: 'c1', name: 'Phase 1 Launch', objective: 'Reach', status: 'Active',
      startDate: new Date(),
      budgetConfig: { total: 5000, daily: 100, spent: 450 },
      bots: []
    }
  ];

  media: MockMedia[] = [
    {
        id: 'm1', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', type: 'Image', size: 102400, governanceStatus: 'Approved', createdAt: new Date()
    }
  ];
}

export const mockDb = new MockDatabase();
