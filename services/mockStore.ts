
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, User, UserRole, UserStatus, MediaItem, BotActivity, ActivityStatus, ActionType } from '../types';
import { api } from './api';

// --- MOCK DATA CONSTANTS ---

const DEFAULT_BOTS: BotConfig[] = [
  {
    type: BotType.Creator,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 60,
    logs: [],
    config: {
      contentTopics: ['Industry News', 'Tips & Tricks', 'Company Updates', 'Thought Leadership'],
      targetPlatforms: [Platform.Twitter, Platform.LinkedIn],
      generationMode: 'AI',
      safetyLevel: 'Moderate',
      workHoursStart: '09:00',
      workHoursEnd: '17:00',
      aiStrategy: {
        creativityLevel: 'Medium',
        brandVoice: 'Professional',
        keywordsToInclude: ['Innovation', 'Growth'],
        topicsToAvoid: ['Politics', 'Religion']
      }
    },
    stats: { currentDailyActions: 0, maxDailyActions: 10, consecutiveErrors: 0 }
  },
  {
    type: BotType.Engagement,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 30,
    logs: [],
    config: {
      replyToMentions: true,
      replyToComments: true,
      maxDailyInteractions: 50,
      safetyLevel: 'Moderate',
      workHoursStart: '08:00',
      workHoursEnd: '20:00',
      minDelaySeconds: 60,
      maxDelaySeconds: 300
    },
    stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 }
  },
  {
    type: BotType.Finder,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 120,
    logs: [],
    config: {
      trackKeywords: ['SaaS', 'AI', 'Automation', 'Marketing'],
      trackAccounts: [],
      autoSaveToDrafts: true,
      safetyLevel: 'Conservative',
      workHoursStart: '00:00',
      workHoursEnd: '23:59'
    },
    stats: { currentDailyActions: 0, maxDailyActions: 100, consecutiveErrors: 0 }
  },
  {
    type: BotType.Growth,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 240,
    logs: [],
    config: {
      growthTags: ['#Tech', '#Startup', '#Marketing', '#Founder'],
      interactWithCompetitors: false,
      unfollowAfterDays: 7,
      safetyLevel: 'Conservative',
      workHoursStart: '10:00',
      workHoursEnd: '18:00'
    },
    stats: { currentDailyActions: 0, maxDailyActions: 25, consecutiveErrors: 0 }
  }
];

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

// --- Simulation Steps Definition ---
const SIMULATION_STEPS: Record<BotType, string[]> = {
  [BotType.Creator]: [
    "Analyzing trending topics in sector...",
    "Drafting content with Gemini 1.5 Flash...",
    "Applying brand voice 'Professional'...",
    "Running safety compliance check...",
    "Scheduling post for optimal time."
  ],
  [BotType.Engagement]: [
    "Scanning notifications for mentions...",
    "Filtering spam and low-quality accounts...",
    "Generating context-aware replies...",
    "Adding human-like typing delay...",
    "Reply posted successfully."
  ],
  [BotType.Finder]: [
    "Monitoring keywords: #SaaS, #AI...",
    "Analyzing sentiment of recent posts...",
    "Filtering competitive noise...",
    "Identifying high-potential leads...",
    "Saved 3 leads to drafts."
  ],
  [BotType.Growth]: [
    "Identifying target audience from hashtags...",
    "Checking account health and limits...",
    "Executing safe follow strategy...",
    "Engaging with recent posts...",
    "Cycle complete. Cooling down."
  ]
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
    
    // Auto-seed simulation bots if empty
    if (this.bots.length === 0) {
        this.bots = DEFAULT_BOTS;
    }
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
    if (!this.isSimulation) {
      try {
        const remoteBots = await api.getBots();
        if (Array.isArray(remoteBots) && remoteBots.length > 0) {
          return remoteBots;
        }
      } catch (error) {
        console.warn("[HybridStore] API error, falling back to local defaults.", error);
      }
      return DEFAULT_BOTS;
    }

    if (this.bots.length === 0) {
        this.bots = DEFAULT_BOTS;
        this.saveState();
    }
    return this.bots;
  }
  
  async toggleBot(type: BotType): Promise<BotConfig[]> {
     if (!this.isSimulation) {
        try {
            return await api.toggleBot(type);
        } catch (e) {
            console.error("Failed to toggle bot in prod:", e);
            return DEFAULT_BOTS;
        }
     }
     
     this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
     this.saveState();
     return this.bots;
  }

  async updateBot(bot: BotConfig): Promise<BotConfig[]> {
      if (!this.isSimulation) {
        try {
            return await api.updateBot(bot);
        } catch (e) {
            console.error("Failed to update bot in prod:", e);
            return DEFAULT_BOTS;
        }
      }
      
      this.bots = this.bots.map(b => b.type === bot.type ? bot : b);
      this.saveState();
      return this.bots;
  }

  // Enhanced Simulation
  async simulateBot(type: BotType): Promise<BotActivity[]> {
      if (!this.isSimulation) {
          try {
              // Production: Trigger backend simulation
              return await api.simulateBot(type);
          } catch (e) {
              console.error("Simulation failed:", e);
              return [];
          }
      }
      
      // Local Simulation: Async Execution
      // We return the initial "STARTED" activity immediately, but kick off the sequence in background
      
      const newActivityId = `sim-${Date.now()}`;
      const startActivity: BotActivity = {
          id: newActivityId,
          botType: type,
          actionType: ActionType.ANALYZE,
          platform: Platform.Twitter,
          status: ActivityStatus.STARTED,
          message: "Starting simulation cycle...",
          createdAt: new Date().toISOString()
      };

      if (!this.activities[type]) this.activities[type] = [];
      this.activities[type].unshift(startActivity);

      // Set bot status to Running
      this.bots = this.bots.map(b => b.type === type ? { ...b, status: 'Running' } : b);

      // Fire and forget logic
      this._runSimulationSteps(type, newActivityId);

      return [startActivity];
  }

  private async _runSimulationSteps(type: BotType, runId: string) {
      const steps = SIMULATION_STEPS[type];
      
      for (const stepMsg of steps) {
          await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500)); // Random delay 800ms-1.3s
          
          const stepActivity: BotActivity = {
              id: `step-${Date.now()}`,
              botType: type,
              actionType: ActionType.ANALYZE,
              platform: Platform.Twitter,
              status: ActivityStatus.STARTED, // Keep as running/started for intermediate steps
              message: stepMsg,
              createdAt: new Date().toISOString()
          };
          
          if (!this.activities[type]) this.activities[type] = [];
          this.activities[type].unshift(stepActivity);
      }

      // Final Success
      await new Promise(resolve => setTimeout(resolve, 500));
      const successActivity: BotActivity = {
          id: `done-${Date.now()}`,
          botType: type,
          actionType: ActionType.POST,
          platform: Platform.Twitter,
          status: ActivityStatus.SUCCESS,
          message: "Cycle completed successfully.",
          finishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
      };
      this.activities[type].unshift(successActivity);

      // Update Bot Stats & Status
      this.bots = this.bots.map(b => {
          if (b.type === type) {
              return {
                  ...b,
                  status: 'Idle',
                  lastRun: new Date().toISOString(),
                  stats: {
                      ...b.stats,
                      currentDailyActions: b.stats.currentDailyActions + 1
                  }
              };
          }
          return b;
      });
      this.saveState();
  }

  // --- Activity Log ---
  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    if (!this.isSimulation) {
        try {
            return await api.getBotActivity(type);
        } catch (e) {
            console.warn("Failed to fetch activity:", e);
            return [];
        }
    }
    
    if (!this.activities[type]) {
        this.activities[type] = [];
    }
    return this.activities[type];
  }

  // --- Stats & Settings ---
  async getStats(): Promise<DashboardStats> { 
      try {
          return !this.isSimulation ? await api.getStats() : { 
              totalPosts: this.posts.length, 
              totalReach: 12500, 
              engagementRate: 4.2, 
              activeBots: this.bots.filter(b => b.enabled).length 
          };
      } catch (e) {
          return { totalPosts: 0, totalReach: 0, engagementRate: 0, activeBots: 0 };
      }
  }

  async getSettings(): Promise<UserSettings> { 
      try {
        return !this.isSimulation ? await api.getSettings() : this.settings; 
      } catch (e) {
        return this.settings;
      }
  }
  
  async saveSettings(s: UserSettings): Promise<UserSettings> { 
      if (!this.isSimulation) return api.saveSettings(s);
      this.settings = s;
      this.saveState();
      return s; 
  }
  
  async getUsers(): Promise<User[]> { 
      try {
        return !this.isSimulation ? await api.getUsers() : this.users; 
      } catch (e) {
        return this.users;
      }
  }
  
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
  
  async getMedia(): Promise<MediaItem[]> { 
      try {
        return !this.isSimulation ? await api.getMedia() : this.media; 
      } catch (e) {
        return this.media;
      }
  }
  
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
      return {} as User; 
  }
}

export const store = new HybridStore();
