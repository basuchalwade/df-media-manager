
import { BotConfig, BotType, DashboardStats, MediaItem, Post, PostStatus, Platform, Campaign, CampaignObjective, CampaignStatus, UserSettings, PlatformAnalytics, EnhancementType, MediaVariant, User, UserRole, UserStatus, BotActivity } from "../types";

// Initial Mock Data
const INITIAL_BOTS: BotConfig[] = [
  { type: BotType.Creator, enabled: true, status: 'Idle', intervalMinutes: 60, stats: { currentDailyActions: 5, maxDailyActions: 20, consecutiveErrors: 0 }, config: { topics: ['Tech'], safetyLevel: 'Moderate' }, logs: [] },
  { type: BotType.Engagement, enabled: true, status: 'Running', intervalMinutes: 30, stats: { currentDailyActions: 42, maxDailyActions: 100, consecutiveErrors: 0 }, config: { replyTone: 'Casual' }, logs: [] },
  { type: BotType.Finder, enabled: false, status: 'Idle', intervalMinutes: 120, stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 }, config: { keywords: ['AI'] }, logs: [] },
  { type: BotType.Growth, enabled: false, status: 'Idle', intervalMinutes: 240, stats: { currentDailyActions: 0, maxDailyActions: 30, consecutiveErrors: 0 }, config: { target: 'Startup Founders' }, logs: [] },
];

const INITIAL_MEDIA: MediaItem[] = [
  { id: '1', name: 'product-launch.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80', size: 2400000, createdAt: new Date().toISOString(), governance: { status: 'approved' }, processingStatus: 'ready' },
  { id: '2', name: 'team.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80', size: 1200000, createdAt: new Date().toISOString(), governance: { status: 'pending' }, processingStatus: 'ready' },
];

const INITIAL_POSTS: Post[] = [
  { id: '101', content: 'Excited to announce our Series A! 🚀 #StartupLife', platforms: [Platform.Twitter, Platform.LinkedIn], status: PostStatus.Published, scheduledFor: new Date().toISOString(), author: 'User', metrics: { likes: 120, shares: 10, comments: 5 }, generatedByAi: false },
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  { 
      id: 'c1', 
      name: 'Q3 Launch', 
      objective: CampaignObjective.Traffic, 
      status: CampaignStatus.Active, 
      platforms: [Platform.LinkedIn], 
      botIds: [BotType.Creator], 
      startDate: new Date().toISOString(), 
      budget: { total: 5000, daily: 150, spent: 450, currency: 'USD' }, 
      metrics: { impressions: 15000, clicks: 450, conversions: 12, costPerResult: 15, roas: 3.2 }, 
      aiRecommendations: [],
      intelligence: {
          pacing: { expectedSpend: 500, actualSpend: 450, pacingStatus: 'OPTIMAL', burnRate: 90, daysRemaining: 20 },
          attribution: [{ botId: BotType.Creator, spend: 400, impactScore: 85, liftPercentage: 12, primaryContribution: 'Impressions' }],
          kpiMapping: { "Primary Metric": "Link Clicks" },
          strategySummary: "Campaign is pacing well. Creator Bot is driving significant traffic."
      }
  }
];

const INITIAL_USERS: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@contentcaster.io',
        role: UserRole.Admin,
        status: UserStatus.Active,
        lastActive: 'Now',
        connectedAccounts: {
            [Platform.Twitter]: { connected: true, handle: '@admin', lastSync: '2h ago' }
        }
    }
];

class MockStore {
  private posts: Post[] = INITIAL_POSTS;
  private bots: BotConfig[] = INITIAL_BOTS;
  private media: MediaItem[] = INITIAL_MEDIA;
  private campaigns: Campaign[] = INITIAL_CAMPAIGNS;
  private users: User[] = INITIAL_USERS;
  
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedPosts = localStorage.getItem('cc_posts');
    if (savedPosts) this.posts = JSON.parse(savedPosts);
    
    const savedBots = localStorage.getItem('cc_bots');
    if (savedBots) this.bots = JSON.parse(savedBots);

    const savedMedia = localStorage.getItem('cc_media');
    if (savedMedia) this.media = JSON.parse(savedMedia);

    const savedCampaigns = localStorage.getItem('cc_campaigns');
    if (savedCampaigns) this.campaigns = JSON.parse(savedCampaigns);

    const savedUsers = localStorage.getItem('cc_users');
    if (savedUsers) this.users = JSON.parse(savedUsers);
  }

  private save() {
    localStorage.setItem('cc_posts', JSON.stringify(this.posts));
    localStorage.setItem('cc_bots', JSON.stringify(this.bots));
    localStorage.setItem('cc_media', JSON.stringify(this.media));
    localStorage.setItem('cc_campaigns', JSON.stringify(this.campaigns));
    localStorage.setItem('cc_users', JSON.stringify(this.users));
  }

  // --- Posts ---
  async getPosts() { return [...this.posts]; }
  
  async addPost(post: Post) {
    this.posts.unshift(post);
    this.save();
    return post;
  }

  async updatePost(updated: Post) {
    this.posts = this.posts.map(p => p.id === updated.id ? updated : p);
    this.save();
    return updated;
  }

  async deletePost(id: string) {
    this.posts = this.posts.filter(p => p.id !== id);
    this.save();
  }

  // --- Bots ---
  async getBots() { return [...this.bots]; }

  async toggleBot(type: BotType) {
    this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled } : b);
    this.save();
    return this.bots;
  }

  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    const bot = this.bots.find(b => b.type === type);
    return bot?.logs || [];
  }

  // --- Media ---
  async getMedia() { return [...this.media]; }
  
  async uploadMedia(file: File) {
    const mockUrl = URL.createObjectURL(file);
    const item: MediaItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: mockUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
      governance: { status: 'approved' },
      processingStatus: 'ready'
    };
    this.media.unshift(item);
    this.save();
    return item;
  }

  async deleteMedia(id: string) {
    this.media = this.media.filter(m => m.id !== id);
    this.save();
  }

  // --- Campaigns ---
  async getCampaigns() { return [...this.campaigns]; }
  async addCampaign(camp: Campaign) {
    this.campaigns.unshift(camp);
    this.save();
    return camp;
  }

  async applyCampaignRecommendation(campaignId: string, recId: string) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
        const rec = campaign.aiRecommendations.find(r => r.id === recId);
        if (rec) rec.status = 'applied';
        this.save();
    }
  }

  async dismissCampaignRecommendation(campaignId: string, recId: string) {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (campaign) {
        const rec = campaign.aiRecommendations.find(r => r.id === recId);
        if (rec) rec.status = 'dismissed';
        this.save();
    }
  }

  // --- Media Governance & Variants ---
  async approveMedia(id: string, approvedBy: string) {
    this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'approved', approvedBy, approvedAt: new Date().toISOString() } } : m);
    this.save();
    return this.media;
  }

  async rejectMedia(id: string, reason: string) {
    this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'rejected', rejectionReason: reason } } : m);
    this.save();
    return this.media;
  }

  async resetMedia(id: string) {
     this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'pending' } } : m);
     this.save();
     return this.media;
  }

  async createVariant(id: string, platform: string): Promise<void> {
    this.media = this.media.map(m => {
        if (m.id === id) {
            const variant: MediaVariant = {
                id: `v-${Date.now()}`,
                parentId: id,
                platform,
                url: m.url, // Mock
                thumbnailUrl: m.thumbnailUrl || m.url,
                width: 1080,
                height: 1080,
                createdAt: new Date().toISOString(),
                generatedBy: 'ai',
                status: 'ready'
            };
            return { ...m, variants: [...(m.variants || []), variant] };
        }
        return m;
    });
    this.save();
  }

  async createEnhancedVariant(id: string, type: EnhancementType): Promise<void> {
      this.media = this.media.map(m => {
          if (m.id === id) {
              const variant: MediaVariant = {
                  id: `v-enh-${Date.now()}`,
                  parentId: id,
                  platform: 'All',
                  url: m.url, // Mock
                  thumbnailUrl: m.thumbnailUrl || m.url,
                  width: 1080,
                  height: 1080,
                  createdAt: new Date().toISOString(),
                  generatedBy: 'ai',
                  status: 'ready',
                  enhancementType: type
              };
              return { ...m, variants: [...(m.variants || []), variant] };
          }
          return m;
      });
      this.save();
  }

  async deleteVariant(parentId: string, variantId: string): Promise<void> {
      this.media = this.media.map(m => {
          if (m.id === parentId) {
              return { ...m, variants: (m.variants || []).filter(v => v.id !== variantId) };
          }
          return m;
      });
      this.save();
  }

  // --- Users & Settings ---
  async getUsers() { return [...this.users]; }
  
  async addUser(user: Partial<User>) {
      const newUser: User = {
          id: Date.now().toString(),
          name: user.name || 'New User',
          email: user.email || '',
          role: user.role || UserRole.Viewer,
          status: user.status || UserStatus.Invited,
          lastActive: 'Never',
          connectedAccounts: {},
          ...user
      };
      this.users.push(newUser);
      this.save();
      return this.users;
  }

  async updateUser(id: string, updates: Partial<User>) {
      this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
      this.save();
      return this.users;
  }

  async togglePlatformConnection(platform: Platform) {
      // Toggle for current user (ID 1)
      this.users = this.users.map(u => {
          if (u.id === '1') {
              const isConnected = u.connectedAccounts[platform]?.connected;
              return {
                  ...u,
                  connectedAccounts: {
                      ...u.connectedAccounts,
                      [platform]: {
                          connected: !isConnected,
                          handle: !isConnected ? `@demo_${platform.toLowerCase()}` : undefined,
                          lastSync: !isConnected ? 'Just now' : undefined
                      }
                  }
              };
          }
          return u;
      });
      this.save();
      return this.users.find(u => u.id === '1');
  }

  async getCurrentUser() {
    return this.users.find(u => u.id === '1') || INITIAL_USERS[0];
  }

  async getSettings(): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      demoMode: false,
      geminiApiKey: '',
      general: { language: 'English', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
      workspace: { timezone: 'UTC', defaultTone: 'Professional' },
      notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
      security: { twoFactorEnabled: false, sessionTimeout: '30m' },
      automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
    };
    return this.get<UserSettings>('cc_settings') || defaultSettings;
  }

  async saveSettings(settings: UserSettings): Promise<UserSettings> {
    this.set('cc_settings', settings);
    return settings;
  }

  // --- Analytics ---
  async getPlatformAnalytics(platform: any): Promise<PlatformAnalytics> {
    return {
      platform: platform,
      summary: {
        followers: 12500,
        followersGrowth: 5.4,
        impressions: 45000,
        impressionsGrowth: 12.5,
        engagementRate: 3.8,
        engagementGrowth: 1.2
      },
      history: [
        { date: 'Mon', followers: 12000, impressions: 4000, engagement: 300 },
        { date: 'Tue', followers: 12100, impressions: 4500, engagement: 350 },
        { date: 'Wed', followers: 12200, impressions: 4200, engagement: 320 },
        { date: 'Thu', followers: 12300, impressions: 4800, engagement: 380 },
        { date: 'Fri', followers: 12400, impressions: 5000, engagement: 400 },
        { date: 'Sat', followers: 12450, impressions: 5500, engagement: 450 },
        { date: 'Sun', followers: 12500, impressions: 6000, engagement: 500 },
      ]
    };
  }

  async getStats() {
    const posts = await this.getPosts();
    const bots = await this.getBots();
    return {
      totalPosts: posts.length,
      totalReach: posts.length * 1250 + 5400,
      engagementRate: 4.2,
      activeBots: bots.filter(b => b.enabled).length
    };
  }

  // Helpers
  private get<T>(key: string): T | null { 
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null; 
  }
  private set(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }
}

export const store = new MockStore();
