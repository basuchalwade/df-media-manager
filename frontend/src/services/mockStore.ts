
import { BotConfig, BotType, DashboardStats, MediaItem, Post, PostStatus, Platform, Campaign, CampaignObjective, CampaignStatus, UserSettings, PlatformAnalytics, EnhancementType, MediaVariant } from "../types";

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
  { id: 'c1', name: 'Q3 Launch', objective: CampaignObjective.Traffic, status: CampaignStatus.Active, platforms: [Platform.LinkedIn], botIds: [BotType.Creator], startDate: new Date().toISOString(), budget: { total: 5000, daily: 150, spent: 450, currency: 'USD' }, metrics: { impressions: 15000, clicks: 450, conversions: 12, costPerResult: 15, roas: 3.2 }, aiRecommendations: [] }
];

class MockStore {
  constructor() {
    if (!localStorage.getItem('cc_posts')) localStorage.setItem('cc_posts', JSON.stringify(INITIAL_POSTS));
    if (!localStorage.getItem('cc_bots')) localStorage.setItem('cc_bots', JSON.stringify(INITIAL_BOTS));
    if (!localStorage.getItem('cc_media')) localStorage.setItem('cc_media', JSON.stringify(INITIAL_MEDIA));
    if (!localStorage.getItem('cc_campaigns')) localStorage.setItem('cc_campaigns', JSON.stringify(INITIAL_CAMPAIGNS));
  }

  // --- Helpers ---
  private get<T>(key: string): T { return JSON.parse(localStorage.getItem(key) || '[]'); }
  private set(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }

  // --- API ---
  async getBots() { return this.get<BotConfig[]>('cc_bots'); }
  async toggleBot(type: BotType) {
    const bots = await this.getBots();
    const updated = bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
    this.set('cc_bots', updated);
    return updated;
  }
  async updateBot(bot: BotConfig) {
    const bots = await this.getBots();
    const updated = bots.map(b => b.type === bot.type ? bot : b);
    this.set('cc_bots', updated);
    return updated;
  }
  async getBotActivity(type: BotType) {
    const bots = await this.getBots();
    return bots.find(b => b.type === type)?.logs || [];
  }
  
  async getPosts() { return this.get<Post[]>('cc_posts'); }
  async addPost(post: Post) {
    const posts = await this.getPosts();
    this.set('cc_posts', [post, ...posts]);
    return post;
  }
  async updatePost(post: Post) {
    const posts = await this.getPosts();
    const updated = posts.map(p => p.id === post.id ? post : p);
    this.set('cc_posts', updated);
    return post;
  }
  async deletePost(id: string) {
    const posts = await this.getPosts();
    this.set('cc_posts', posts.filter(p => p.id !== id));
  }

  async getMedia() { return this.get<MediaItem[]>('cc_media'); }
  async uploadMedia(file: File) {
    const url = URL.createObjectURL(file);
    const item: MediaItem = { 
        id: Date.now().toString(), 
        name: file.name, 
        type: file.type.startsWith('video') ? 'video' : 'image', 
        url, 
        size: file.size, 
        createdAt: new Date().toISOString(), 
        governance: { status: 'approved' },
        processingStatus: 'ready'
    };
    const media = await this.getMedia();
    this.set('cc_media', [item, ...media]);
    return item;
  }
  async deleteMedia(id: string) {
    const media = await this.getMedia();
    this.set('cc_media', media.filter(m => m.id !== id));
  }
  
  async getCampaigns() { return this.get<Campaign[]>('cc_campaigns'); }
  async addCampaign(camp: Campaign) {
    const list = await this.getCampaigns();
    this.set('cc_campaigns', [camp, ...list]);
    return camp;
  }

  // --- Media Governance & Variants ---
  async approveMedia(id: string, approvedBy: string) {
    const media = await this.getMedia();
    const updated = media.map(m => m.id === id ? { ...m, governance: { status: 'approved', approvedBy, approvedAt: new Date().toISOString() } } : m);
    this.set('cc_media', updated);
    return updated;
  }

  async rejectMedia(id: string, reason: string) {
    const media = await this.getMedia();
    const updated = media.map(m => m.id === id ? { ...m, governance: { status: 'rejected', rejectionReason: reason } } : m);
    this.set('cc_media', updated);
    return updated;
  }

  async resetMedia(id: string) {
     const media = await this.getMedia();
     const updated = media.map(m => m.id === id ? { ...m, governance: { status: 'pending' } } : m);
     this.set('cc_media', updated);
     return updated;
  }

  async createVariant(id: string, platform: string): Promise<void> {
    const media = await this.getMedia();
    const updated = media.map(m => {
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
    this.set('cc_media', updated);
  }

  async createEnhancedVariant(id: string, type: EnhancementType): Promise<void> {
      const media = await this.getMedia();
      const updated = media.map(m => {
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
      this.set('cc_media', updated);
  }

  async deleteVariant(parentId: string, variantId: string): Promise<void> {
      const media = await this.getMedia();
      const updated = media.map(m => {
          if (m.id === parentId) {
              return { ...m, variants: (m.variants || []).filter(v => v.id !== variantId) };
          }
          return m;
      });
      this.set('cc_media', updated);
  }

  // --- Settings ---
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

  // --- Stats & User ---
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

  async getCurrentUser() {
    return { 
        id: '1', 
        name: 'Admin', 
        email: 'admin@contentcaster.io', 
        role: 'Admin' as any, 
        status: 'Active' as any, 
        lastActive: 'Now', 
        connectedAccounts: { 
            [Platform.Twitter]: { connected: true, handle: '@admin' } 
        } 
    };
  }
}

export const store = new MockStore();
