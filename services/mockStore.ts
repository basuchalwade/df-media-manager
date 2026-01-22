
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, AnalyticsDataPoint, User, UserRole, UserStatus, MediaItem, BotLogEntry, LogLevel } from '../types';

// Initial Mock Data
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
  },
  {
    id: '4',
    content: '5 Tips for Better Productivity using AI Tools. 🧵👇 #Productivity',
    platforms: [Platform.Twitter, Platform.LinkedIn],
    scheduledFor: new Date(Date.now() + 250000000).toISOString(),
    status: PostStatus.NeedsReview,
    generatedByAi: true,
    author: BotType.Creator,
    creationContext: {
        source: BotType.Creator,
        topic: 'Productivity Hacks'
    }
  },
  {
    id: '5',
    content: 'Why Design Systems Matter in 2025. A deep dive.',
    platforms: [Platform.LinkedIn],
    scheduledFor: new Date(Date.now() + 300000000).toISOString(),
    status: PostStatus.Approved,
    generatedByAi: true,
    author: BotType.Creator,
    creationContext: {
        source: BotType.Creator,
        topic: 'Design Systems'
    }
  },
  {
    id: '6',
    content: 'Old announcement from last year.',
    platforms: [Platform.Facebook],
    scheduledFor: new Date(Date.now() - 1000000000).toISOString(),
    status: PostStatus.Archived,
    generatedByAi: false,
    author: 'User'
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
    const time = new Date(now.getTime() - i * 1000 * 60 * (Math.random() * 30 + 5)); // Random interval back in time
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
    stats: {
      currentDailyActions: 12,
      maxDailyActions: 50,
      consecutiveErrors: 0,
      itemsCreated: 3 // 3 Drafts
    },
    config: {
      contentTopics: ['SaaS', 'AI', 'Marketing'],
      targetPlatforms: [Platform.Twitter, Platform.LinkedIn],
      generationMode: 'AI',
      workHoursStart: '09:00',
      workHoursEnd: '17:00',
      safetyLevel: 'Moderate',
      aiStrategy: {
        creativityLevel: 'High',
        brandVoice: 'Professional',
        keywordsToInclude: ['Innovation', 'Growth'],
        topicsToAvoid: ['Politics', 'Competitors']
      },
      calendarConfig: {
        enabled: true,
        maxPostsPerDay: 3,
        blackoutDates: []
      }
    }
  },
  { 
    type: BotType.Engagement, 
    enabled: true, 
    intervalMinutes: 15, 
    status: 'LimitReached', 
    logs: generateLogs(40, BotType.Engagement),
    stats: {
      currentDailyActions: 150,
      maxDailyActions: 150,
      consecutiveErrors: 0,
      itemsCreated: 150 // Interactions
    },
    config: {
      replyToMentions: true,
      replyToComments: true,
      watchHashtags: ['#TechNews', '#StartupLife'],
      enableAutoLike: true,
      maxDailyInteractions: 150,
      mutedKeywords: ['NSFW', 'Spam', 'Crypto'],
      safetyLevel: 'Aggressive',
      aiStrategy: {
        creativityLevel: 'Medium',
        brandVoice: 'Helpful',
        keywordsToInclude: [],
        topicsToAvoid: ['Controversial']
      }
    }
  },
  { 
    type: BotType.Finder, 
    enabled: false, 
    intervalMinutes: 240, 
    status: 'Idle', 
    logs: generateLogs(10, BotType.Finder),
    stats: {
      currentDailyActions: 0,
      maxDailyActions: 100,
      consecutiveErrors: 0,
      itemsCreated: 0
    },
    config: {
      trackKeywords: ['Artificial Intelligence', 'Machine Learning'],
      trackAccounts: ['@TechCrunch', '@Verge'],
      autoSaveToDrafts: true,
      safetyLevel: 'Conservative'
    }
  },
  { 
    type: BotType.Growth, 
    enabled: true, 
    intervalMinutes: 30, 
    status: 'Cooldown', 
    logs: generateLogs(35, BotType.Growth),
    stats: {
      currentDailyActions: 45,
      maxDailyActions: 200,
      consecutiveErrors: 2,
      cooldownEndsAt: new Date(Date.now() + 45 * 60000).toISOString(),
      itemsCreated: 45 // Follows
    },
    config: {
      growthTags: ['#FollowFriday', '#TechCommunity'],
      interactWithCompetitors: true,
      unfollowAfterDays: 7,
      hourlyActionLimit: 10,
      stopOnConsecutiveErrors: 5,
      minDelaySeconds: 60
    }
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  demoMode: true,
  geminiApiKey: '',
};

const INITIAL_USERS: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    email: 'admin@contentcaster.ai', 
    role: UserRole.Admin, 
    status: UserStatus.Active, 
    lastActive: 'Just now',
    connectedAccounts: {
      [Platform.Twitter]: { connected: true, handle: '@admin_x', lastSync: '10 mins ago' },
      [Platform.LinkedIn]: { connected: true, handle: 'Admin Professional', lastSync: '1 hour ago' }
    }
  },
  { 
    id: '2', 
    name: 'Sarah Monitor', 
    email: 'sarah@contentcaster.ai', 
    role: UserRole.Monitor, 
    status: UserStatus.Active, 
    lastActive: '2 hours ago',
    connectedAccounts: {
      [Platform.Instagram]: { connected: true, handle: '@sarah_snaps', lastSync: '5 mins ago' }
    }
  },
  { 
    id: '3', 
    name: 'John Guest', 
    email: 'john@guest.com', 
    role: UserRole.Viewer, 
    status: UserStatus.Suspended, 
    lastActive: '5 days ago',
    connectedAccounts: {}
  },
  { 
    id: '4', 
    name: 'Pending Invite', 
    email: 'mark@marketing.com', 
    role: UserRole.Monitor, 
    status: UserStatus.Invited, 
    lastActive: 'Never',
    connectedAccounts: {}
  },
];

// Simple in-memory store to simulate backend persistence in the frontend demo
class MockStore {
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[];
  private media: MediaItem[] = []; // In-memory media storage
  private currentUserId: string = '1'; // Simulate logged in user

  constructor() {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem('postmaster_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : { ...DEFAULT_SETTINGS };

    const savedUsers = localStorage.getItem('postmaster_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : [...INITIAL_USERS];

    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : [...INITIAL_POSTS];

    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [...INITIAL_BOTS];
  }

  // --- Session Simulation ---
  async getCurrentUser(): Promise<User | undefined> {
    return this.users.find(u => u.id === this.currentUserId);
  }

  // --- Platform Integration Methods ---
  async togglePlatformConnection(platform: Platform): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) throw new Error("User not found");

    const user = this.users[userIndex];
    const isConnected = user.connectedAccounts[platform]?.connected;

    // Toggle connection
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
  getPosts(): Promise<Post[]> {
    return Promise.resolve([...this.posts]);
  }

  addPost(post: Post): Promise<Post> {
    this.posts.unshift(post);
    this.savePosts();
    return Promise.resolve(post);
  }

  updatePost(post: Post): Promise<Post> {
    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.savePosts();
    return Promise.resolve(post);
  }

  deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(p => p.id !== id);
    this.savePosts();
    return Promise.resolve();
  }

  private savePosts() {
    localStorage.setItem('postmaster_posts', JSON.stringify(this.posts));
  }

  // --- Bots ---
  getBots(): Promise<BotConfig[]> {
    return Promise.resolve([...this.bots]);
  }

  toggleBot(type: BotType): Promise<BotConfig[]> {
    this.bots = this.bots.map(b => 
      b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b
    );
    this.saveBots();
    return Promise.resolve([...this.bots]);
  }

  updateBot(updatedBot: BotConfig): Promise<BotConfig[]> {
    this.bots = this.bots.map(b => b.type === updatedBot.type ? updatedBot : b);
    this.saveBots();
    return Promise.resolve([...this.bots]);
  }

  private saveBots() {
    localStorage.setItem('postmaster_bots', JSON.stringify(this.bots));
  }

  // --- Stats ---
  getStats(): Promise<DashboardStats> {
    const published = this.posts.filter(p => p.status === PostStatus.Published);
    const totalReach = published.reduce((acc, p) => acc + (p.engagement?.likes || 0) * 15, 0);
    const totalEngagement = published.reduce((acc, p) => acc + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0);
    
    return Promise.resolve({
      totalPosts: this.posts.length,
      totalReach,
      engagementRate: published.length ? parseFloat((totalEngagement / totalReach * 100).toFixed(1)) : 0,
      activeBots: this.bots.filter(b => b.enabled).length
    });
  }

  // --- Settings ---
  getSettings(): Promise<UserSettings> {
    return Promise.resolve({ ...this.settings });
  }

  saveSettings(newSettings: UserSettings): Promise<UserSettings> {
    this.settings = newSettings;
    localStorage.setItem('postmaster_settings', JSON.stringify(newSettings));
    return Promise.resolve({ ...this.settings });
  }

  // --- User Management ---
  getUsers(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  addUser(user: Omit<User, 'id' | 'lastActive' | 'connectedAccounts'>): Promise<User[]> {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      lastActive: 'Never',
      connectedAccounts: {}
    };
    this.users.push(newUser);
    this.saveUsers();
    return Promise.resolve([...this.users]);
  }

  updateUser(id: string, updates: Partial<User>): Promise<User[]> {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
    this.saveUsers();
    return Promise.resolve([...this.users]);
  }

  private saveUsers() {
    localStorage.setItem('postmaster_users', JSON.stringify(this.users));
  }

  // --- Media Library ---
  getMedia(): Promise<MediaItem[]> {
    return Promise.resolve([...this.media]);
  }

  // Simulate file upload validation and storage
  uploadMedia(file: File): Promise<MediaItem> {
    return new Promise((resolve, reject) => {
      // 1. Validate Types (Security: Whitelist only)
      const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
      const allowedVideos = ['video/mp4'];
      const allowedTypes = [...allowedImages, ...allowedVideos];

      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`Invalid file type: ${file.type}. Only JPG, PNG, WEBP images and MP4 videos are allowed.`));
        return;
      }

      // 2. Validate Size (Max 50MB for all types to prevent DOS/Storage issues)
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        reject(new Error(`File "${file.name}" exceeds the 50MB limit.`));
        return;
      }
      
      // 3. Sanitize Filename (Security: Prevent path traversal, scripts, spaces)
      // Replace spaces with underscores, remove non-alphanumeric chars except dots/underscores/hyphens
      const sanitizedName = file.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '');

      // 4. Create Object URL (Simulating cloud upload)
      const url = URL.createObjectURL(file);
      
      // Use random ID suffix to handle rapid bulk uploads
      const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6);

      const newItem: MediaItem = {
        id,
        name: sanitizedName,
        type: allowedImages.includes(file.type) ? 'image' : 'video',
        url,
        size: file.size,
        createdAt: new Date().toISOString(),
        dimensions: allowedImages.includes(file.type) ? 'Original' : undefined
      };

      this.media.unshift(newItem);
      resolve(newItem);
    });
  }

  deleteMedia(id: string): Promise<MediaItem[]> {
    this.media = this.media.filter(m => m.id !== id);
    return Promise.resolve([...this.media]);
  }

  // Helper to simulate creating an optimized copy
  createOptimizedCopy(originalId: string, variantName: string): Promise<MediaItem> {
    const original = this.media.find(m => m.id === originalId);
    if (!original) return Promise.reject("Original file not found");

    const newItem: MediaItem = {
      ...original,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: `${variantName}_${original.name}`,
      createdAt: new Date().toISOString(),
      dimensions: variantName === 'Square' ? '1080x1080' : variantName === 'Story' ? '1080x1920' : 'Optimized'
    };

    this.media.unshift(newItem);
    return Promise.resolve(newItem);
  }

  // --- Analytics ---
  getPlatformAnalytics(platform: Platform | 'All'): Promise<PlatformAnalytics> {
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
    
    return Promise.resolve({
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
    });
  }
}

export const store = new MockStore();
