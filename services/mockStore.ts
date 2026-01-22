import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, AnalyticsDataPoint, User, UserRole, UserStatus, MediaItem, BotLogEntry, LogLevel, BotActivity, ActivityStatus, ActionType } from '../types';
import { api } from './api';

// --- MOCK DATA CONSTANTS (Kept for Simulation Mode) ---
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    content: 'Just launched our new feature! #Tech #Startup',
    platforms: [Platform.Twitter, Platform.LinkedIn],
    scheduledFor: new Date().toISOString(),
    status: PostStatus.Published,
    generatedByAi: false,
    author: 'User',
    mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    mediaType: 'image',
    engagement: { likes: 120, shares: 34, comments: 12 }
  },
];

const generateActivity = (count: number, botType: BotType): BotActivity[] => {
  const acts: BotActivity[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const status = Math.random() > 0.9 ? ActivityStatus.FAILED : ActivityStatus.SUCCESS;
    const time = new Date(now.getTime() - i * 1000 * 60 * 30);
    
    acts.push({
      id: `act-${i}-${botType}`,
      botType,
      actionType: ActionType.ANALYZE,
      platform: Platform.Twitter,
      status,
      message: status === ActivityStatus.SUCCESS ? 'Action performed successfully' : 'Connection timeout detected',
      error: status === ActivityStatus.FAILED ? '504 Gateway Timeout' : undefined,
      createdAt: time.toISOString(),
      finishedAt: time.toISOString()
    });
  }
  return acts;
};

// Hybrid Store Implementation
class HybridStore {
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[] = [];
  private media: MediaItem[] = [];
  private activities: Record<string, BotActivity[]> = {};

  constructor() {
    // Initialize Mock Data
    const savedSettings = localStorage.getItem('postmaster_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : { 
        demoMode: true,
        geminiApiKey: '',
        general: { language: 'English (US)', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
        workspace: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, defaultTone: 'Professional' },
        notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
        security: { twoFactorEnabled: false, sessionTimeout: '30m' },
        automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
    };
    
    // Ensure Demo Mode default
    if (savedSettings === null) this.settings.demoMode = true;

    // Load Mock Data
    const savedUsers = localStorage.getItem('postmaster_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : []; 

    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : INITIAL_POSTS;

    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [];
  }

  private get isSimulation(): boolean {
    return this.settings.demoMode;
  }
  
  private saveState() {
      if (this.isSimulation) {
          localStorage.setItem('postmaster_posts', JSON.stringify(this.posts));
          localStorage.setItem('postmaster_bots', JSON.stringify(this.bots));
          localStorage.setItem('postmaster_settings', JSON.stringify(this.settings));
          localStorage.setItem('postmaster_users', JSON.stringify(this.users));
      }
  }

  async getCurrentUser(): Promise<User | undefined> {
    if (!this.isSimulation) {
        const users = await api.getUsers();
        return users[0];
    }
    // Simple mock return
    return { id: '1', name: 'Admin', email: 'admin@test.com', role: UserRole.Admin, status: UserStatus.Active, lastActive: 'Now', connectedAccounts: {} };
  }

  // --- Post Methods ---
  async getPosts(): Promise<Post[]> {
    if (!this.isSimulation) return api.getPosts();
    return this.posts;
  }

  async addPost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.addPost(post);
    this.posts = [post, ...this.posts];
    this.saveState();
    return post;
  }

  async updatePost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.updatePost(post);
    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.saveState();
    return post;
  }

  async deletePost(id: string): Promise<void> {
    if (!this.isSimulation) return api.deletePost(id);
    this.posts = this.posts.filter(p => p.id !== id);
    this.saveState();
  }

  // --- Bot Methods ---
  async getBots(): Promise<BotConfig[]> {
    if (!this.isSimulation) return api.getBots();
    return this.bots.length ? this.bots : []; 
  }
  
  async toggleBot(type: BotType): Promise<BotConfig[]> {
     if (!this.isSimulation) return api.toggleBot(type);
     this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
     this.saveState();
     return this.bots;
  }

  async updateBot(bot: BotConfig): Promise<BotConfig[]> {
      if (!this.isSimulation) return api.updateBot(bot);
      this.bots = this.bots.map(b => b.type === bot.type ? bot : b);
      this.saveState();
      return this.bots;
  }

  // --- Activity Log ---
  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    if (!this.isSimulation) return api.getBotActivity(type);
    
    if (!this.activities[type]) {
      this.activities[type] = generateActivity(25, type);
    }
    return this.activities[type];
  }

  // --- Stats & Settings ---
  async getStats(): Promise<DashboardStats> { 
      return !this.isSimulation ? api.getStats() : { 
          totalPosts: this.posts.length, 
          totalReach: 12500, 
          engagementRate: 4.2, 
          activeBots: this.bots.filter(b => b.enabled).length 
      }; 
  }

  async getSettings(): Promise<UserSettings> { return !this.isSimulation ? api.getSettings() : this.settings; }
  
  async saveSettings(s: UserSettings): Promise<UserSettings> { 
      if (!this.isSimulation) return api.saveSettings(s);
      this.settings = s;
      this.saveState();
      return s; 
  }
  
  async getUsers(): Promise<User[]> { return !this.isSimulation ? api.getUsers() : this.users; }
  
  async addUser(u: any): Promise<User[]> { 
      if (!this.isSimulation) return api.addUser(u);
      this.users.push({ ...u, id: Date.now().toString() });
      this.saveState();
      return this.users;
  }
  
  async updateUser(id: string, u: any): Promise<User[]> { 
      if (!this.isSimulation) return api.updateUser(id, u);
      this.users = this.users.map(user => user.id === id ? { ...user, ...u } : user);
      this.saveState();
      return this.users;
  }
  
  async getMedia(): Promise<MediaItem[]> { return !this.isSimulation ? api.getMedia() : this.media; }
  
  async uploadMedia(f: File): Promise<MediaItem> { 
      if (!this.isSimulation) return api.uploadMedia(f);
      const newItem: MediaItem = {
          id: Date.now().toString(),
          name: f.name,
          type: f.type.startsWith('video') ? 'video' : 'image',
          url: URL.createObjectURL(f),
          size: f.size,
          createdAt: new Date().toISOString()
      };
      this.media.push(newItem);
      return newItem;
  }
  
  async deleteMedia(id: string): Promise<MediaItem[]> { 
      if (!this.isSimulation) return api.deleteMedia(id);
      this.media = this.media.filter(m => m.id !== id);
      return this.media;
  }
  
  async createOptimizedCopy(id: string, v: string): Promise<MediaItem> { return {} as MediaItem; }
  
  async getPlatformAnalytics(p: any): Promise<PlatformAnalytics> { 
      // Mock Analytics
      return {
          platform: p,
          summary: { followers: 1200, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 },
          history: Array.from({length: 7}, (_, i) => ({
              date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(),
              followers: 1200 + i*10,
              impressions: 4000 + Math.random()*1000,
              engagement: 200 + Math.random()*50
          }))
      }; 
  }
  
  async togglePlatformConnection(p: Platform): Promise<User> { 
      // Simple toggle mock for simulation
      return {} as User; 
  }
}

export const store = new HybridStore();