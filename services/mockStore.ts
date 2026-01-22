
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, AnalyticsDataPoint, User, UserRole, UserStatus, MediaItem, BotLogEntry, LogLevel } from '../types';
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
  {
    id: '2',
    content: 'The future of space travel is looking bright! 🚀 #SpaceX #Mars',
    platforms: [Platform.Twitter],
    scheduledFor: new Date(Date.now() + 86400000).toISOString(),
    status: PostStatus.Scheduled,
    generatedByAi: true,
    author: BotType.Creator,
    variants: [
        { id: 'v1', name: 'Original', content: 'The future of space travel is looking bright! 🚀 #SpaceX #Mars' },
        { id: 'v2', name: 'Question Hook', content: 'Do you think we will live on Mars by 2030? 🌌 The future of space travel is accelerating! #SpaceX' }
    ],
    activeVariantId: 'v1'
  },
  {
    id: '3',
    content: 'Check out this amazing view! 🎥 #Nature',
    platforms: [Platform.Instagram],
    scheduledFor: new Date(Date.now() + 172800000).toISOString(),
    status: PostStatus.Draft,
    generatedByAi: false,
    author: 'User',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    mediaType: 'video'
  }
];

// Helper to generate logs
const generateLogs = (count: number, type: BotType): BotLogEntry[] => {
  const logs: BotLogEntry[] = [];
  const now = new Date();
  
  const messages = {
    [BotType.Creator]: ['Drafted post for LinkedIn', 'Checked content calendar', 'Analyzing trending topics', 'Content generation successful', 'Added 3 new drafts to Studio'],
    [BotType.Engagement]: ['Replied to @user123 on X', 'Liked post #882', 'Checked for new mentions', 'Daily limit warning'],
    [BotType.Finder]: ['Scanned 50 posts', 'Found new competitor activity on X', 'Saved draft to library', 'Keyword alert: "AI"'],
    [BotType.Growth]: ['Followed @dev_jane on X', 'Unfollowed inactive user', 'API Rate Limit (429) detected', 'Cooling down']
  };

  const levels: LogLevel[] = ['Info', 'Success', 'Info', 'Warning', 'Error'];

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - i * 1000 * 60 * (Math.random() * 30 + 5));
    const msgList = messages[type];
    const msg = msgList[Math.floor(Math.random() * msgList.length)];
    
    let level: LogLevel = 'Info';
    if (msg.includes('warning') || msg.includes('Limit')) level = 'Warning';
    if (msg.includes('Error') || msg.includes('Failed')) level = 'Error';
    if (msg.includes('Successful') || msg.includes('Saved') || msg.includes('Drafted') || msg.includes('Added')) level = 'Success';

    logs.push({
      id: `log-${i}-${type}`,
      timestamp: time.toISOString(),
      level,
      message: msg
    });
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const INITIAL_BOTS: BotConfig[] = [
  { 
    type: BotType.Creator, 
    enabled: true, 
    intervalMinutes: 60, 
    status: 'Running', 
    logs: generateLogs(25, BotType.Creator),
    stats: { currentDailyActions: 12, maxDailyActions: 50, consecutiveErrors: 0, itemsCreated: 3 },
    config: { contentTopics: ['SaaS', 'AI', 'Marketing'], targetPlatforms: [Platform.Twitter, Platform.LinkedIn], generationMode: 'AI', workHoursStart: '09:00', workHoursEnd: '17:00', safetyLevel: 'Moderate', aiStrategy: { creativityLevel: 'High', brandVoice: 'Professional', keywordsToInclude: ['Innovation', 'Growth'], topicsToAvoid: ['Politics', 'Competitors'] }, calendarConfig: { enabled: true, maxPostsPerDay: 3, blackoutDates: [] } }
  },
  { 
    type: BotType.Engagement, 
    enabled: true, 
    intervalMinutes: 15, 
    status: 'LimitReached', 
    logs: generateLogs(40, BotType.Engagement),
    stats: { currentDailyActions: 150, maxDailyActions: 150, consecutiveErrors: 0, itemsCreated: 150 },
    config: { replyToMentions: true, replyToComments: true, watchHashtags: ['#TechNews', '#StartupLife'], enableAutoLike: true, maxDailyInteractions: 150, mutedKeywords: ['NSFW', 'Spam', 'Crypto'], safetyLevel: 'Aggressive', aiStrategy: { creativityLevel: 'Medium', brandVoice: 'Helpful', keywordsToInclude: [], topicsToAvoid: ['Controversial'] } }
  },
  { 
    type: BotType.Finder, 
    enabled: false, 
    intervalMinutes: 240, 
    status: 'Idle', 
    logs: generateLogs(10, BotType.Finder),
    stats: { currentDailyActions: 0, maxDailyActions: 100, consecutiveErrors: 0, itemsCreated: 0 },
    config: { trackKeywords: ['Artificial Intelligence', 'Machine Learning'], trackAccounts: ['@TechCrunch', '@Verge'], autoSaveToDrafts: true, safetyLevel: 'Conservative' }
  },
  { 
    type: BotType.Growth, 
    enabled: true, 
    intervalMinutes: 30, 
    status: 'Cooldown', 
    logs: generateLogs(35, BotType.Growth),
    stats: { currentDailyActions: 45, maxDailyActions: 200, consecutiveErrors: 2, cooldownEndsAt: new Date(Date.now() + 45 * 60000).toISOString(), itemsCreated: 45 },
    config: { growthTags: ['#FollowFriday', '#TechCommunity'], interactWithCompetitors: true, unfollowAfterDays: 7, hourlyActionLimit: 10, stopOnConsecutiveErrors: 5, minDelaySeconds: 60 }
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  demoMode: true,
  geminiApiKey: '',
  general: { language: 'English (US)', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
  workspace: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, defaultTone: 'Professional' },
  notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
  security: { twoFactorEnabled: false, sessionTimeout: '30m' },
  automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
};

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@contentcaster.ai', role: UserRole.Admin, status: UserStatus.Active, lastActive: 'Just now', connectedAccounts: { [Platform.Twitter]: { connected: true, handle: '@admin_x', lastSync: '10 mins ago' }, [Platform.LinkedIn]: { connected: true, handle: 'Admin Professional', lastSync: '1 hour ago' } } },
  { id: '2', name: 'Sarah Monitor', email: 'sarah@contentcaster.ai', role: UserRole.Monitor, status: UserStatus.Active, lastActive: '2 hours ago', connectedAccounts: { [Platform.Instagram]: { connected: true, handle: '@sarah_snaps', lastSync: '5 mins ago' } } },
];

// Hybrid Store Implementation
class HybridStore {
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[];
  private media: MediaItem[] = [];
  private currentUserId: string = '1';

  constructor() {
    // Initialize Mock Data
    const savedSettings = localStorage.getItem('postmaster_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SETTINGS };
    
    // Ensure Demo Mode default
    if (savedSettings === null) this.settings.demoMode = true;

    // Load Mock Data
    const savedUsers = localStorage.getItem('postmaster_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [...INITIAL_USERS];
    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : [...INITIAL_POSTS];
    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [...INITIAL_BOTS];
  }

  private get isSimulation(): boolean {
    return this.settings.demoMode;
  }

  // --- Session Simulation ---
  async getCurrentUser(): Promise<User | undefined> {
    if (!this.isSimulation) {
        // In real app, this would check JWT/Session
        // For now, we fetch the first admin user from DB
        const users = await api.getUsers();
        return users[0];
    }
    return this.users.find(u => u.id === this.currentUserId);
  }

  // --- Platform Integration ---
  async togglePlatformConnection(platform: Platform): Promise<User> {
    if (!this.isSimulation) {
        // Real implementation would oauth redirect
        console.warn("Real platform connection requires OAuth backend implementation");
        return (await this.getCurrentUser())!;
    }
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) throw new Error("User not found");
    const user = this.users[userIndex];
    const isConnected = user.connectedAccounts[platform]?.connected;
    const updatedUser = {
      ...user,
      connectedAccounts: {
        ...user.connectedAccounts,
        [platform]: {
          connected: !isConnected,
          handle: !isConnected ? `@demo_${platform.toLowerCase().replace('twitter', 'x')}` : undefined,
          lastSync: !isConnected ? 'Just now' : undefined
        }
      }
    };
    this.users[userIndex] = updatedUser;
    this.saveUsers();
    return updatedUser;
  }

  // --- Posts ---
  async getPosts(): Promise<Post[]> {
    if (!this.isSimulation) return api.getPosts();
    return [...this.posts];
  }

  async addPost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.addPost(post);
    this.posts.unshift(post);
    this.savePosts();
    return post;
  }

  async updatePost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.updatePost(post);
    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.savePosts();
    return post;
  }

  async deletePost(id: string): Promise<void> {
    if (!this.isSimulation) return api.deletePost(id);
    this.posts = this.posts.filter(p => p.id !== id);
    this.savePosts();
  }

  private savePosts() {
    localStorage.setItem('postmaster_posts', JSON.stringify(this.posts));
  }

  // --- Bots ---
  async getBots(): Promise<BotConfig[]> {
    if (!this.isSimulation) return api.getBots();
    return [...this.bots];
  }

  async toggleBot(type: BotType): Promise<BotConfig[]> {
    if (!this.isSimulation) return api.toggleBot(type);
    this.bots = this.bots.map(b => 
      b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b
    );
    this.saveBots();
    return [...this.bots];
  }

  async updateBot(updatedBot: BotConfig): Promise<BotConfig[]> {
    if (!this.isSimulation) return api.updateBot(updatedBot);
    this.bots = this.bots.map(b => b.type === updatedBot.type ? updatedBot : b);
    this.saveBots();
    return [...this.bots];
  }

  private saveBots() {
    localStorage.setItem('postmaster_bots', JSON.stringify(this.bots));
  }

  // --- Stats ---
  async getStats(): Promise<DashboardStats> {
    if (!this.isSimulation) return api.getStats();
    
    const published = this.posts.filter(p => p.status === PostStatus.Published);
    const totalReach = published.reduce((acc, p) => acc + (p.engagement?.likes || 0) * 15, 0);
    const totalEngagement = published.reduce((acc, p) => acc + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0);
    
    return {
      totalPosts: this.posts.length,
      totalReach,
      engagementRate: published.length ? parseFloat((totalEngagement / totalReach * 100).toFixed(1)) : 0,
      activeBots: this.bots.filter(b => b.enabled).length
    };
  }

  // --- Settings ---
  async getSettings(): Promise<UserSettings> {
    if (!this.isSimulation) {
        try {
            const remoteSettings = await api.getSettings();
            // Sync local demo mode pref with remote if needed, but usually remote governs
            this.settings = { ...remoteSettings, demoMode: false }; // Ensure we know we are remote
            return this.settings;
        } catch (e) {
            console.error("Failed to fetch settings, falling back to local", e);
            return this.settings;
        }
    }
    return { ...this.settings };
  }

  async saveSettings(newSettings: UserSettings): Promise<UserSettings> {
    // Special handling: If switching modes, we persist locally first
    if (newSettings.demoMode !== this.settings.demoMode) {
        this.settings.demoMode = newSettings.demoMode;
        localStorage.setItem('postmaster_settings', JSON.stringify(this.settings));
        window.location.reload(); // Reload to reset state context
        return this.settings;
    }

    if (!this.isSimulation) return api.saveSettings(newSettings);
    
    this.settings = newSettings;
    localStorage.setItem('postmaster_settings', JSON.stringify(newSettings));
    return { ...this.settings };
  }

  // --- User Management ---
  async getUsers(): Promise<User[]> {
    if (!this.isSimulation) return api.getUsers();
    return [...this.users];
  }

  async addUser(user: Omit<User, 'id' | 'lastActive' | 'connectedAccounts'>): Promise<User[]> {
    if (!this.isSimulation) return api.addUser(user);
    const newUser: User = { ...user, id: Date.now().toString(), lastActive: 'Never', connectedAccounts: {} };
    this.users.push(newUser);
    this.saveUsers();
    return [...this.users];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User[]> {
    if (!this.isSimulation) return api.updateUser(id, updates);
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveUsers();
    return [...this.users];
  }

  private saveUsers() {
    localStorage.setItem('postmaster_users', JSON.stringify(this.users));
  }

  // --- Media Library ---
  async getMedia(): Promise<MediaItem[]> {
    if (!this.isSimulation) return api.getMedia();
    return [...this.media];
  }

  async uploadMedia(file: File): Promise<MediaItem> {
    if (!this.isSimulation) return api.uploadMedia(file);

    return new Promise((resolve, reject) => {
      const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
      const allowedVideos = ['video/mp4'];
      
      if (![...allowedImages, ...allowedVideos].includes(file.type)) {
        reject(new Error(`Invalid file type: ${file.type}`));
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        reject(new Error(`File too large.`));
        return;
      }
      
      const newItem: MediaItem = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6),
        name: file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, ''),
        type: allowedImages.includes(file.type) ? 'image' : 'video',
        url: URL.createObjectURL(file),
        size: file.size,
        createdAt: new Date().toISOString(),
        dimensions: allowedImages.includes(file.type) ? 'Original' : undefined
      };
      this.media.unshift(newItem);
      resolve(newItem);
    });
  }

  async deleteMedia(id: string): Promise<MediaItem[]> {
    if (!this.isSimulation) return api.deleteMedia(id);
    this.media = this.media.filter(m => m.id !== id);
    return [...this.media];
  }

  async createOptimizedCopy(originalId: string, variantName: string): Promise<MediaItem> {
    // Note: Actual optimization requires backend processing. 
    // In Real DB mode, we'd call an API endpoint.
    // In Mock mode, we fake it.
    if (!this.isSimulation) throw new Error("Optimization requires backend implementation");
    
    const original = this.media.find(m => m.id === originalId);
    if (!original) throw new Error("Original file not found");

    const newItem: MediaItem = {
      ...original,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: `${variantName}_${original.name}`,
      createdAt: new Date().toISOString(),
      dimensions: variantName === 'Square' ? '1080x1080' : variantName === 'Story' ? '1080x1920' : 'Optimized'
    };
    this.media.unshift(newItem);
    return newItem;
  }

  // --- Analytics (Mock Only for now, mapped in API) ---
  async getPlatformAnalytics(platform: Platform | 'All'): Promise<PlatformAnalytics> {
    // This logic is complex to duplicate on backend for this demo, 
    // so we assume the backend has a /stats/analytics endpoint that mimics this structure.
    // For now, we return mock data even in real mode for charts 
    // unless the API endpoint is explicitly built.
    const isAll = platform === 'All';
    const multiplier = isAll ? 5 : 1;
    const history: AnalyticsDataPoint[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const baseFollowers = 1200 * multiplier + (Math.random() * 50);
      const baseImpressions = 5000 * multiplier + (Math.random() * 1000);
      const baseEngagement = 300 * multiplier + (Math.random() * 100);

      history.push({
        date: dayName,
        followers: Math.floor(baseFollowers + (i * 10 * multiplier)), 
        impressions: Math.floor(baseImpressions + (Math.random() * 2000) - 1000), 
        engagement: Math.floor(baseEngagement + (Math.random() * 100 - 50))
      });
    }

    const currentStats = history[history.length - 1];
    return {
      platform,
      summary: {
        followers: currentStats.followers,
        followersGrowth: 2.4,
        impressions: currentStats.impressions * 7, 
        impressionsGrowth: 12.5,
        engagementRate: parseFloat(((currentStats.engagement / currentStats.impressions) * 100).toFixed(2)),
        engagementGrowth: 5.1
      },
      history
    };
  }
}

export const store = new HybridStore();
