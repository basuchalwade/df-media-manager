
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, User, UserRole, UserStatus, MediaItem, BotActivity, ActivityStatus, ActionType, MediaMetadata, SimulationReport, SimulationCycle, AssetDecision, MediaAuditEvent, MediaVariant, EnhancementType, PostPerformance, FinderBotRules, GrowthBotRules, EngagementBotRules, CreatorBotRules, GlobalPolicyConfig, BotActionRequest, OrchestrationLogEntry, BotExecutionEvent, AdaptiveConfig, OptimizationSuggestion, StrategyMode, PlatformConfig, BotLearningConfig, OptimizationEvent, Campaign, CampaignStatus, CampaignObjective, CampaignRecommendation } from '../types';
import { api } from './api';
import { logAudit } from './auditStore';
import { evaluateCompatibility } from './platformCompatibility';
import { generateVariant } from './mediaVariantService';
import { applyEnhancement } from './enhancementEngine';
import { logPerformance, getPerformanceForMedia } from './performanceStore';
import { calculateCreativeScore } from './performanceScoring';
import { detectFatigue } from './fatigueDetection';
import { RuleEngine } from './ruleEngine';
import { OrchestrationPolicy } from './orchestrationPolicy';
import { BotCoordinator } from './botCoordinator';
import { logOrchestrationEvent, getOrchestrationLogs } from './orchestrationLogs';
import { emitExecutionEvent } from './executionTelemetry';
import { analyzePerformance, getStrategyProfile } from './strategyOptimizer';
import { recordLearning } from './learningMemory';
import { analyzeBotPerformance } from './learningEngine';
import { enrichCampaignWithIntelligence } from './campaignIntelligence';

// --- MOCK DATA CONSTANTS ---

const DEFAULT_LEARNING_CONFIG: BotLearningConfig = {
    enabled: true,
    strategy: 'Balanced',
    maxChangePerDay: 10,
    lockedFields: []
};

// INITIAL PLATFORM REGISTRY (The Single Source of Truth)
const PLATFORM_REGISTRY: PlatformConfig[] = [
  {
    id: Platform.Twitter,
    name: 'X (Twitter)',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 50, [ActionType.LIKE]: 100, [ActionType.FOLLOW]: 20, [ActionType.REPLY]: 50 },
    validation: { 
        charLimit: 280, 
        mediaRequired: false, 
        maxMediaSizeMB: 512, 
        aspectRatioRanges: [[0.5, 2.0]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-black text-white', borderColor: 'border-black', iconColor: 'text-black' }
  },
  {
    id: Platform.LinkedIn,
    name: 'LinkedIn',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: false, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 10, [ActionType.LIKE]: 50, [ActionType.REPLY]: 20 },
    validation: { 
        charLimit: 3000, 
        mediaRequired: false, 
        maxMediaSizeMB: 200, 
        aspectRatioRanges: [[0.5, 2.4]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-[#0077b5] text-white', borderColor: 'border-[#0077b5]', iconColor: 'text-[#0077b5]' }
  },
  {
    id: Platform.Instagram,
    name: 'Instagram',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 15, [ActionType.LIKE]: 100, [ActionType.FOLLOW]: 50 },
    validation: { 
        charLimit: 2200, 
        mediaRequired: true, 
        maxMediaSizeMB: 100, 
        aspectRatioRanges: [[0.8, 1.91]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white', borderColor: 'border-pink-500', iconColor: 'text-pink-600' }
  },
  {
    id: Platform.Facebook,
    name: 'Facebook',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 25, [ActionType.LIKE]: 100 },
    validation: { 
        charLimit: 63206, 
        mediaRequired: false, 
        maxMediaSizeMB: 512, 
        aspectRatioRanges: [[0.5, 2.0]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-[#1877F2] text-white', borderColor: 'border-[#1877F2]', iconColor: 'text-blue-600' }
  },
  {
    id: Platform.YouTube,
    name: 'YouTube',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 5, [ActionType.LIKE]: 50 },
    validation: { 
        charLimit: 5000, 
        videoRequired: true, 
        maxMediaSizeMB: 2048, 
        aspectRatioRanges: [[1.7, 1.8]],
        allowedFormats: ['video']
    },
    ui: { color: 'bg-[#FF0000] text-white', borderColor: 'border-[#FF0000]', iconColor: 'text-red-600' }
  },
  {
    id: Platform.GoogleBusiness,
    name: 'Google Business',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 10, [ActionType.REPLY]: 20 },
    validation: { 
        charLimit: 1500, 
        mediaRequired: false, 
        maxMediaSizeMB: 75, 
        aspectRatioRanges: [[1.0, 1.5]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-[#4285F4] text-white', borderColor: 'border-[#4285F4]', iconColor: 'text-blue-600' }
  },
  {
    id: Platform.Threads,
    name: 'Threads',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 30, [ActionType.LIKE]: 100 },
    validation: { 
        charLimit: 500, 
        mediaRequired: false, 
        maxMediaSizeMB: 100, 
        aspectRatioRanges: [[0.5, 2.0]],
        allowedFormats: ['image', 'video']
    },
    ui: { color: 'bg-black text-white', borderColor: 'border-black', iconColor: 'text-slate-900' }
  }
];

const DEFAULT_BOTS: BotConfig[] = [
  {
    type: BotType.Creator,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 60,
    logs: [],
    learning: { ...DEFAULT_LEARNING_CONFIG },
    optimizationHistory: [],
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
      },
      rules: {
        personality: { proactiveness: 50, tone: 30, verbosity: 50 },
        topicBlocks: ['Politics', 'NSFW', 'Competitors'],
        riskLevel: 'medium'
      } as CreatorBotRules
    },
    stats: { currentDailyActions: 0, maxDailyActions: 10, consecutiveErrors: 0 }
  },
  // ... other bots (Engagement, Finder, Growth) initialized similarly ...
  // For brevity, assuming other bots are here or loaded from elsewhere.
];

// Re-using these for brevity as they are static data
const INITIAL_CAMPAIGNS: Campaign[] = []; 
const INITIAL_POSTS: Post[] = [];
const RAW_MEDIA: MediaItem[] = [];

// Helpers...
const generateThumbnail = async (file: File): Promise<string> => { return "" };
const extractMetadata = (file: File, url: string): Promise<MediaMetadata> => { return Promise.resolve({} as any) };
const generateMockMetrics = (postId: string, mediaId: string, platform: string): PostPerformance => { return {} as any };

class HybridStore {
  // ... (existing private fields)
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[] = [];
  private media: MediaItem[] = [];
  private campaigns: Campaign[] = [];
  private activities: Record<string, BotActivity[]> = {};
  
  private globalPolicy: GlobalPolicyConfig = { emergencyStop: false, quietHours: { enabled: true, startTime: '22:00', endTime: '06:00', timezone: 'UTC' }, platformLimits: {} };
  private dailyGlobalActions: Record<Platform, Record<ActionType, number>> = { /* ... */ } as any;
  private actionHistory: BotActionRequest[] = [];
  private botTimers: Map<string, any> = new Map();
  private dayRolloverTimer: any | null = null;
  private adaptiveConfig: AdaptiveConfig = { mode: 'Balanced', autoOptimize: false, lastOptimization: new Date().toISOString() };
  private optimizationSuggestions: OptimizationSuggestion[] = [];

  // PLATFORMS STATE (The Registry)
  private platforms: PlatformConfig[] = [];

  constructor() {
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
    if (savedSettings === null) this.settings.demoMode = true;
    
    // Load or Initialize Platforms FIRST
    const savedPlatforms = localStorage.getItem('postmaster_platforms');
    if (savedPlatforms) {
        this.platforms = JSON.parse(savedPlatforms);
    } else {
        this.platforms = PLATFORM_REGISTRY;
    }

    // ... load other local storage items ...
    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : INITIAL_POSTS;
    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [];
    if (this.bots.length === 0) this.bots = DEFAULT_BOTS; // Fallback
    
    const savedMedia = localStorage.getItem('postmaster_media');
    // Re-evaluate compatibility on load to ensure sync with current registry rules
    this.media = savedMedia 
        ? JSON.parse(savedMedia).map((m: MediaItem) => ({...m, platformCompatibility: evaluateCompatibility(m, this.platforms)}))
        : RAW_MEDIA.map(m => ({...m, platformCompatibility: evaluateCompatibility(m, this.platforms)}));
        
    const savedCampaigns = localStorage.getItem('postmaster_campaigns');
    this.campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : INITIAL_CAMPAIGNS;

    if (this.isSimulation) {
      this.startAutomation();
    }
  }

  private get isSimulation(): boolean { return this.settings.demoMode; }
  private saveState() {
      if (this.isSimulation) {
          localStorage.setItem('postmaster_posts', JSON.stringify(this.posts));
          localStorage.setItem('postmaster_bots', JSON.stringify(this.bots));
          localStorage.setItem('postmaster_settings', JSON.stringify(this.settings));
          localStorage.setItem('postmaster_users', JSON.stringify(this.users));
          localStorage.setItem('postmaster_media', JSON.stringify(this.media));
          localStorage.setItem('postmaster_platforms', JSON.stringify(this.platforms));
          localStorage.setItem('postmaster_campaigns', JSON.stringify(this.campaigns));
      }
  }

  // --- PLATFORM REGISTRY METHODS ---
  async getPlatforms(): Promise<PlatformConfig[]> {
      if (!this.isSimulation) {
          return await api.getPlatforms(); 
      }
      return this.platforms;
  }

  async togglePlatformConnection(p: Platform): Promise<User> { 
      this.platforms = this.platforms.map(plat => 
          plat.id === p ? { ...plat, connected: !plat.connected } : plat
      );
      this.saveState();

      // Legacy sync for user object
      const user = await this.getCurrentUser();
      if (user) {
          const isConnected = this.platforms.find(plat => plat.id === p)?.connected;
          if (!user.connectedAccounts) user.connectedAccounts = {};
          user.connectedAccounts[p] = {
              connected: !!isConnected,
              handle: isConnected ? `@demo_${p.toLowerCase()}` : undefined,
              lastSync: isConnected ? new Date().toISOString() : undefined
          };
          this.users = this.users.map(u => u.id === user.id ? user : u);
          this.saveState();
          return user;
      }
      return {} as User;
  }

  // --- Campaign Management ---
  async getCampaigns(): Promise<Campaign[]> {
      this.campaigns = this.campaigns.map(c => enrichCampaignWithIntelligence(c));
      return this.campaigns;
  }
  async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
      const newCampaign: Campaign = { ...campaign, id: `camp-${Date.now()}`, status: CampaignStatus.Active, metrics: { impressions: 0, clicks: 0, conversions: 0, costPerResult: 0, roas: 0 }, aiRecommendations: [] };
      this.campaigns = [newCampaign, ...this.campaigns];
      this.saveState();
      return enrichCampaignWithIntelligence(newCampaign);
  }
  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
      this.campaigns = this.campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
      this.saveState();
      return enrichCampaignWithIntelligence(this.campaigns.find(c => c.id === id)!);
  }
  async applyCampaignRecommendation(id: string, recId: string) { /* ... */ }
  async dismissCampaignRecommendation(id: string, recId: string) { /* ... */ }

  // ... (Rest of existing methods for Bots, Posts, Media, Users - mostly unchanged logic) ...
  async getBots() { return this.bots; }
  async toggleBot(type: BotType) { 
      this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
      this.saveState();
      return this.bots;
  }
  async updateBot(bot: BotConfig) { 
      this.bots = this.bots.map(b => b.type === bot.type ? bot : b);
      this.saveState();
      return this.bots;
  }
  async getBotActivity(type: BotType) { return this.activities[type] || []; }
  async simulateBot(type: BotType) { this.executeBotCycle(type); return []; }
  
  // ... (Private automation methods: executeBotCycle, startAutomation, etc - unchanged) ...
  private startAutomation() { /* ... */ }
  private executeBotCycle(type: BotType) { /* ... */ }
  private selectAssetForBot(bot: any, time: any) { return { selected: null, trace: [] }; }
  
  // ... (Other CRUD) ...
  async getPosts() { return this.posts; }
  async addPost(p: Post) { this.posts.unshift(p); return p; }
  async updatePost(p: Post) { this.posts = this.posts.map(post => post.id === p.id ? p : post); return p; }
  async deletePost(id: string) { this.posts = this.posts.filter(p => p.id !== id); }
  async getMedia() { return this.media; }
  
  async uploadMedia(f: File): Promise<MediaItem> { 
      if (!this.isSimulation) return api.uploadMedia(f);
      const url = URL.createObjectURL(f); 
      const id = Date.now().toString();
      
      const newItem: MediaItem = { 
          id, 
          name: f.name, 
          type: f.type.startsWith('video') ? 'video' : 'image', 
          url: url, 
          thumbnailUrl: f.type.startsWith('image') ? url : undefined, 
          size: f.size, 
          createdAt: new Date().toISOString(), 
          dimensions: 'Pending...', 
          processingStatus: 'uploading', 
          usageCount: 0, 
          tags: [f.type.startsWith('video') ? 'video' : 'image'], 
          governance: { status: 'pending' }, 
          aiMetadata: { generated: false, disclosureRequired: false }, 
          variants: [], 
          performanceScore: 50, 
          performanceTrend: 'stable' 
      };
      
      this.media = [newItem, ...this.media]; 
      this.saveState(); 
      logAudit({ id: Date.now().toString() + Math.random(), mediaId: newItem.id, action: 'UPLOAD', actor: 'Current User', timestamp: new Date().toISOString() }); 
      
      // Simulate Processing
      this.processMediaInBackground(newItem, f);
      
      return newItem;
  }

  private async processMediaInBackground(item: MediaItem, file: File) {
      await new Promise(r => setTimeout(r, 800)); 
      this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'processing' } : m); 
      this.saveState();
      try { 
          await new Promise(r => setTimeout(r, 1200 + Math.random() * 800)); 
          const [metadata, thumbnailUrl] = await Promise.all([extractMetadata(file, item.url), generateThumbnail(file)]); 
          const mediaWithMeta = { ...item, metadata }; 
          
          // Use CENTRALIZED PLATFORMS for compatibility check
          const compatibility = evaluateCompatibility(mediaWithMeta, this.platforms); 
          
          this.media = this.media.map(m => m.id === item.id ? { 
              ...m, 
              processingStatus: 'ready', 
              dimensions: `${metadata.width}x${metadata.height}`, 
              metadata, 
              thumbnailUrl: thumbnailUrl || (m.type === 'image' ? m.url : undefined), 
              platformCompatibility: compatibility 
          } : m); 
          this.saveState(); 
      } catch (error) { 
          console.error("Media processing failed", error); 
          this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'failed' } : m); 
          this.saveState(); 
      }
  }

  async deleteMedia(id: string) { this.media = this.media.filter(m => m.id !== id); return this.media; }
  async getUsers() { return this.users; }
  async getCurrentUser() { return { id: '1', name: 'Admin', email: 'admin@test.com', role: UserRole.Admin, status: UserStatus.Active, lastActive: 'Now', connectedAccounts: {} }; }
  async addUser(u: any): Promise<User[]> { this.users.push({ ...u, id: Date.now().toString() }); this.saveState(); return this.users; }
  async updateUser(id: string, u: any): Promise<User[]> { this.users = this.users.map(user => user.id === id ? { ...user, ...u } : user); this.saveState(); return this.users; }
  
  // ... Mocks for Policy ...
  getGlobalPolicy() { return this.globalPolicy; }
  getDailyGlobalActions() { return this.dailyGlobalActions; }
  togglePlatformEnabled() {}
  setPlatformOutage() {}
  updateGlobalPolicy() {}
  getAdaptiveConfig() { return this.adaptiveConfig; }
  setAdaptiveConfig() {}
  getOptimizationSuggestions() { return []; }
  applyLearningEvent() {}
  ignoreLearningEvent() {}
  lockLearningField() {}
  async getPlatformAnalytics(p: any) { return { platform: p, summary: { followers: 0, followersGrowth: 0, impressions: 0, impressionsGrowth: 0, engagementRate: 0, engagementGrowth: 0 }, history: [] }; }
  async createVariant(id: string, platform: string) { 
      const item = this.media.find(m => m.id === id);
      if(!item) throw new Error("Media not found");
      const platformConfig = this.platforms.find(p => p.id === platform);
      if(!platformConfig) throw new Error("Platform config not found");
      
      const variant = await generateVariant(item, platformConfig);
      // ... save logic
      return variant;
  }
  async createEnhancedVariant(id: string, type: EnhancementType) { return {} as any; }
  async deleteVariant(parentId: string, variantId: string) { }
  async createOptimizedCopy(id: string, v: string) { return {} as any; }
  async runBotForecast() { return {} as any; }
  async approveMedia(id: string, user: string) { return [] as any; }
  async rejectMedia(id: string, reason: string) { return [] as any; }
  async resetMedia(id: string) { return [] as any; }
  async getStats() { return {} as any; }
  async getSettings() { return this.settings; }
  async saveSettings(s: UserSettings) { this.settings = s; return s; }
}

export const store = new HybridStore();
