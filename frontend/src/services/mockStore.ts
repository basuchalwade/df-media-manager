
import { BotConfig, BotType, DashboardStats, MediaItem, Post, PostStatus, Platform, Campaign, CampaignObjective, CampaignStatus, UserSettings, PlatformAnalytics, EnhancementType, MediaVariant, User, UserRole, UserStatus, BotActivity, MediaMetadata, PlatformCompatibility, ActivityStatus, EngagementBotRules } from "../types";
import { logAudit } from './auditStore';
import { enrichCampaignWithIntelligence } from './campaignIntelligence';
import { evaluateCompatibility } from './platformCompatibility';

// Initial Data Constants
const INITIAL_BOTS: BotConfig[] = [
  { type: BotType.Creator, enabled: true, status: 'Idle', intervalMinutes: 60, stats: { currentDailyActions: 5, maxDailyActions: 20, consecutiveErrors: 0, cooldownEndsAt: undefined, itemsCreated: 0 }, config: { contentTopics: ['Tech'], safetyLevel: 'Moderate' }, logs: [] },
  { type: BotType.Engagement, enabled: true, status: 'Running', intervalMinutes: 30, stats: { currentDailyActions: 42, maxDailyActions: 100, consecutiveErrors: 0, cooldownEndsAt: undefined, itemsCreated: 0 }, config: { rules: { replyTone: 'casual', emojiLevel: 50, maxRepliesPerHour: 20, skipNegativeSentiment: true } as EngagementBotRules }, logs: [] },
  { type: BotType.Finder, enabled: false, status: 'Idle', intervalMinutes: 120, stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0, cooldownEndsAt: undefined, itemsCreated: 0 }, config: { trackKeywords: ['AI'] }, logs: [] },
  { type: BotType.Growth, enabled: false, status: 'Idle', intervalMinutes: 240, stats: { currentDailyActions: 0, maxDailyActions: 30, consecutiveErrors: 0, cooldownEndsAt: undefined, itemsCreated: 0 }, config: { growthTags: ['Startup Founders'] }, logs: [] },
];

const INITIAL_MEDIA: MediaItem[] = [
  { 
    id: 'm-netflix', 
    name: 'Netflix_Brand_Asset.png', 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80', 
    size: 1500000, 
    createdAt: new Date().toISOString(), 
    governance: { status: 'approved', approvedBy: 'Admin' }, 
    processingStatus: 'ready', 
    tags: ['brand', 'logo', 'netflix'], 
    collections: ['c1'],
    usageCount: 5, 
    performanceScore: 92, 
    performanceTrend: 'up', 
    metadata: { width: 1000, height: 1000, sizeMB: 1.5, format: 'image/png', aspectRatio: 1, duration: 0 } 
  },
  { 
    id: 'm-team', 
    name: 'Q3_Strategy_Meeting.jpg', 
    type: 'image', 
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 
    size: 3200000, 
    createdAt: new Date().toISOString(), 
    governance: { status: 'approved', approvedBy: 'Sarah' }, 
    processingStatus: 'ready', 
    tags: ['team', 'culture', 'office'], 
    collections: ['c2'],
    usageCount: 1, 
    performanceScore: 78, 
    performanceTrend: 'stable', 
    metadata: { width: 1920, height: 1080, sizeMB: 3.2, format: 'image/jpeg', aspectRatio: 1.77, duration: 0 } 
  },
  {
    id: 'm1',
    name: 'Product_Launch_Teaser.mp4',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    size: 15400000,
    createdAt: new Date().toISOString(),
    dimensions: '1920x1080',
    metadata: { width: 1920, height: 1080, duration: 15, sizeMB: 15.4, format: 'video/mp4', aspectRatio: 1.77 },
    usageCount: 1,
    tags: ['product', 'launch'],
    collections: ['c1'],
    lastUsedAt: new Date().toISOString(),
    processingStatus: 'ready',
    governance: { status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() },
    aiMetadata: { generated: false, disclosureRequired: false },
    variants: [],
    performanceScore: 85,
    performanceTrend: 'up'
  },
  {
    id: 'm3',
    name: 'AI_Generated_Concept.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    size: 1800000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dimensions: '1200x800',
    metadata: { width: 1200, height: 800, duration: 0, sizeMB: 1.8, format: 'image/jpeg', aspectRatio: 1.5 },
    usageCount: 0,
    tags: ['ai', 'concept', 'NSFW'], 
    collections: [],
    processingStatus: 'ready',
    governance: { status: 'pending' },
    aiMetadata: { generated: true, tool: 'Midjourney', disclosureRequired: true },
    variants: [],
    performanceScore: 0,
    performanceTrend: 'stable'
  }
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
      intelligence: undefined 
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
  private settings: UserSettings | null = null;
  private simulationTimer: any = null;
  
  constructor() {
    this.loadFromStorage();
    this.startSimulation();
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
    const savedSettings = localStorage.getItem('cc_settings');
    if (savedSettings) this.settings = JSON.parse(savedSettings);
  }

  private save() {
    localStorage.setItem('cc_posts', JSON.stringify(this.posts));
    localStorage.setItem('cc_bots', JSON.stringify(this.bots));
    localStorage.setItem('cc_media', JSON.stringify(this.media));
    localStorage.setItem('cc_campaigns', JSON.stringify(this.campaigns));
    localStorage.setItem('cc_users', JSON.stringify(this.users));
    if (this.settings) localStorage.setItem('cc_settings', JSON.stringify(this.settings));
  }

  private startSimulation() {
      if (this.simulationTimer) clearInterval(this.simulationTimer);
      this.simulationTimer = setInterval(() => {
          this.bots = this.bots.map(bot => {
              if (bot.enabled && bot.status === 'Running') {
                  const chance = Math.random();
                  if (chance > 0.7) {
                      const newLog: BotActivity = {
                          id: Date.now().toString(),
                          botType: bot.type,
                          actionType: 'ANALYZE',
                          platform: 'System',
                          status: ActivityStatus.SUCCESS,
                          message: `Executed periodic check. Processed ${Math.floor(Math.random() * 10)} items.`,
                          createdAt: new Date().toISOString()
                      };
                      const logs = [newLog, ...bot.logs].slice(0, 50);
                      return { ...bot, logs, lastRun: new Date().toISOString() };
                  }
              }
              return bot;
          });
          this.save();
      }, 5000);
  }

  // --- Methods ---

  async getPosts() { return [...this.posts]; }
  async addPost(post: Post) { this.posts.unshift(post); this.save(); return post; }
  async updatePost(updated: Post) { this.posts = this.posts.map(p => p.id === updated.id ? updated : p); this.save(); return updated; }
  async deletePost(id: string) { this.posts = this.posts.filter(p => p.id !== id); this.save(); }

  async getBots() { return [...this.bots]; }
  async toggleBot(type: BotType) { this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled } : b); this.save(); return this.bots; }
  async updateBot(bot: BotConfig) { this.bots = this.bots.map(b => b.type === bot.type ? bot : b); this.save(); return this.bots; }
  async getBotActivity(type: BotType): Promise<BotActivity[]> { const bot = this.bots.find(b => b.type === type); return bot?.logs || []; }

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
      governance: { status: 'approved' }, // Auto-approve in mock for usability
      processingStatus: 'ready',
      metadata: { width: 1000, height: 1000, sizeMB: 1, format: file.type, duration: 0, aspectRatio: 1 },
      platformCompatibility: {}
    };
    // Calculate compatibility
    item.platformCompatibility = evaluateCompatibility(item);
    this.media.unshift(item);
    this.save();
    logAudit({ id: Date.now().toString(), mediaId: item.id, action: 'UPLOAD', actor: 'User', timestamp: new Date().toISOString() });
    return item;
  }
  async deleteMedia(id: string) { this.media = this.media.filter(m => m.id !== id); this.save(); }
  async approveMedia(id: string, user: string) { 
      this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'approved', approvedBy: user } } : m); 
      this.save(); 
      logAudit({ id: Date.now().toString(), mediaId: id, action: 'APPROVED', actor: user, timestamp: new Date().toISOString() }); 
      return this.media; 
  }
  async rejectMedia(id: string, reason: string) { 
      this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'rejected', rejectionReason: reason } } : m); 
      this.save(); 
      logAudit({ id: Date.now().toString(), mediaId: id, action: 'RESTRICTED', actor: 'Admin', timestamp: new Date().toISOString() }); 
      return this.media; 
  }
  async resetMedia(id: string) { this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'pending' } } : m); this.save(); return this.media; }
  
  async createVariant(id: string, platform: string): Promise<void> {
      this.media = this.media.map(m => {
          if (m.id === id) {
              const variant: MediaVariant = {
                  id: `v-${Date.now()}`,
                  parentId: id,
                  platform,
                  url: m.url, 
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
                  url: m.url, 
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

  async getCampaigns() { 
      return this.campaigns.map(enrichCampaignWithIntelligence); 
  }
  async addCampaign(camp: Campaign) { 
      const newCamp = { ...camp, id: Date.now().toString(), aiRecommendations: [], metrics: { impressions: 0, clicks: 0, conversions: 0, costPerResult: 0, roas: 0 } };
      this.campaigns.unshift(newCamp); 
      this.save(); 
      return newCamp; 
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

  async getUsers() { return [...this.users]; }
  async addUser(user: Partial<User>) {
      const newUser: User = { id: Date.now().toString(), name: user.name || 'User', email: user.email || '', role: user.role || UserRole.Viewer, status: UserStatus.Active, lastActive: 'Never', connectedAccounts: {} };
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
      this.users = this.users.map(u => {
          if (u.id === '1') {
              const connected = !u.connectedAccounts[platform]?.connected;
              return { ...u, connectedAccounts: { ...u.connectedAccounts, [platform]: { connected, handle: connected ? '@connected' : undefined, lastSync: 'Now' } } };
          }
          return u;
      });
      this.save();
      return this.users.find(u => u.id === '1');
  }
  async getCurrentUser() { return this.users.find(u => u.id === '1'); }

  async getSettings(): Promise<UserSettings> {
      if (!this.settings) {
          this.settings = {
              demoMode: false,
              geminiApiKey: '',
              general: { language: 'English', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
              workspace: { timezone: 'UTC', defaultTone: 'Professional' },
              notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
              security: { twoFactorEnabled: false, sessionTimeout: '30m' },
              automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
          };
      }
      return this.settings;
  }
  async saveSettings(s: UserSettings) { this.settings = s; this.save(); return s; }

  async getPlatformAnalytics(platform: any): Promise<PlatformAnalytics> {
      return {
          platform: platform,
          summary: { followers: 12500, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 },
          history: Array.from({length: 7}, (_, i) => ({ date: `Day ${i+1}`, followers: 12000 + i*100, impressions: 4000 + i*500, engagement: 300 + i*50 }))
      };
  }

  async getStats() {
      const activeBots = this.bots.filter(b => b.enabled).length;
      return { totalPosts: this.posts.length, totalReach: 15400, engagementRate: 4.2, activeBots };
  }
  
  // Method missing in interface but used in pages
  runBotForecast = async () => ({ timeline: [], risks: [], summary: { totalCycles: 0, successful: 0, skipped: 0 } });
  
  getGlobalPolicy() {
      return { emergencyStop: false, quietHours: { enabled: true, startTime: '22:00', endTime: '06:00', timezone: 'UTC' }, platformLimits: {} };
  }
  updateGlobalPolicy(p: any) {}
  getDailyGlobalActions() { return {}; }
  getPlatforms() { return []; }
  togglePlatformEnabled(id: any) {}
  setPlatformOutage(id: any, val: boolean) {}
  getAdaptiveConfig() { return { mode: 'Balanced', autoOptimize: false, lastOptimization: new Date().toISOString() }; }
  setAdaptiveConfig(c: any) {}
  getOptimizationSuggestions() { return []; }
  applyLearningEvent(id: any, e: any) {}
  ignoreLearningEvent(id: any, e: any) {}
  lockLearningField(id: any, f: any) {}
  simulateBot(type: BotType) {}
}

export const store = new MockStore();
