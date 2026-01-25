
import { BotConfig, BotType, DashboardStats, MediaItem, Post, PostStatus, Platform, Campaign, CampaignObjective, CampaignStatus } from "../types";

// Initial Mock Data
const INITIAL_BOTS: BotConfig[] = [
  { type: BotType.Creator, enabled: true, status: 'Idle', intervalMinutes: 60, stats: { currentDailyActions: 5, maxDailyActions: 20, consecutiveErrors: 0 }, config: { topics: ['Tech'], safetyLevel: 'Moderate' }, logs: [] },
  { type: BotType.Engagement, enabled: true, status: 'Running', intervalMinutes: 30, stats: { currentDailyActions: 42, maxDailyActions: 100, consecutiveErrors: 0 }, config: { replyTone: 'Casual' }, logs: [] },
  { type: BotType.Finder, enabled: false, status: 'Idle', intervalMinutes: 120, stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 }, config: { keywords: ['AI'] }, logs: [] },
  { type: BotType.Growth, enabled: false, status: 'Idle', intervalMinutes: 240, stats: { currentDailyActions: 0, maxDailyActions: 30, consecutiveErrors: 0 }, config: { target: 'Startup Founders' }, logs: [] },
];

const INITIAL_MEDIA: MediaItem[] = [
  { id: '1', name: 'product-launch.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80', size: 2400000, createdAt: new Date().toISOString(), governance: { status: 'approved' } },
  { id: '2', name: 'team.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80', size: 1200000, createdAt: new Date().toISOString(), governance: { status: 'pending' } },
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
    const item: MediaItem = { id: Date.now().toString(), name: file.name, type: file.type.startsWith('video') ? 'video' : 'image', url, size: file.size, createdAt: new Date().toISOString(), governance: { status: 'approved' } };
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

  // --- Stats ---
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
    return { id: '1', name: 'Admin', email: 'admin@contentcaster.io', role: 'Admin', status: 'Active', connectedAccounts: { [Platform.Twitter]: { connected: true, handle: '@admin' } } };
  }
}

export const store = new MockStore();
