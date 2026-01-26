
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
  {
    type: BotType.Engagement,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 30,
    logs: [],
    learning: { ...DEFAULT_LEARNING_CONFIG },
    optimizationHistory: [],
    config: {
      replyToMentions: true,
      replyToComments: true,
      maxDailyInteractions: 50,
      safetyLevel: 'Moderate',
      workHoursStart: '08:00',
      workHoursEnd: '20:00',
      minDelaySeconds: 60,
      maxDelaySeconds: 300,
      rules: {
        replyTone: 'casual',
        emojiLevel: 40,
        maxRepliesPerHour: 10,
        skipNegativeSentiment: true
      } as EngagementBotRules
    },
    stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 }
  },
  {
    type: BotType.Finder,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 120,
    logs: [],
    learning: { ...DEFAULT_LEARNING_CONFIG },
    optimizationHistory: [],
    config: {
      trackKeywords: ['SaaS', 'AI', 'Automation', 'Marketing'],
      trackAccounts: [],
      autoSaveToDrafts: true,
      safetyLevel: 'Conservative',
      workHoursStart: '00:00',
      workHoursEnd: '23:59',
      rules: {
        keywordSources: ['Twitter Trends', 'LinkedIn News'],
        languages: ['English'],
        safeSourcesOnly: true,
        minRelevanceScore: 70
      } as FinderBotRules
    },
    stats: { currentDailyActions: 0, maxDailyActions: 100, consecutiveErrors: 0 }
  },
  {
    type: BotType.Growth,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 240,
    logs: [],
    learning: { ...DEFAULT_LEARNING_CONFIG },
    optimizationHistory: [],
    config: {
      growthTags: ['#Tech', '#Startup', '#Marketing', '#Founder'],
      interactWithCompetitors: false,
      unfollowAfterDays: 7,
      safetyLevel: 'Conservative',
      workHoursStart: '10:00',
      workHoursEnd: '18:00',
      rules: {
        followRatePerHour: 5,
        unfollowAfterDays: 7,
        interestTags: ['#Tech', '#SaaS'],
        ignorePrivateAccounts: true
      } as GrowthBotRules
    },
    stats: { currentDailyActions: 0, maxDailyActions: 25, consecutiveErrors: 0 }
  }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q3 Product Launch',
    objective: CampaignObjective.Traffic,
    status: CampaignStatus.Active,
    platforms: [Platform.LinkedIn, Platform.Twitter],
    botIds: [BotType.Creator, BotType.Engagement],
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 25).toISOString(),
    budget: { total: 5000, daily: 150, spent: 750, currency: 'USD' },
    metrics: { impressions: 45000, clicks: 1200, conversions: 45, costPerResult: 16.66, roas: 3.2 },
    aiRecommendations: []
  },
  {
    id: 'camp-2',
    name: 'Brand Awareness',
    objective: CampaignObjective.Reach,
    status: CampaignStatus.Active,
    platforms: [Platform.Twitter, Platform.Instagram],
    botIds: [BotType.Creator, BotType.Growth],
    startDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    budget: { total: 2000, daily: 50, spent: 850, currency: 'USD' },
    metrics: { impressions: 120000, clicks: 450, conversions: 10, costPerResult: 0.007, roas: 1.5 },
    aiRecommendations: []
  }
];

// ... (Rest of initial data constants like DEFAULT_PLATFORMS, INITIAL_POSTS, RAW_MEDIA remain same) ...
const DEFAULT_PLATFORMS: PlatformConfig[] = [
  {
    id: Platform.Twitter,
    name: 'X (Twitter)',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 50, [ActionType.LIKE]: 100, [ActionType.FOLLOW]: 20, [ActionType.REPLY]: 50 }
  },
  {
    id: Platform.LinkedIn,
    name: 'LinkedIn',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: false, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 10, [ActionType.LIKE]: 50, [ActionType.REPLY]: 20 }
  },
  {
    id: Platform.Instagram,
    name: 'Instagram',
    enabled: true,
    connected: true,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.FOLLOW]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 15, [ActionType.LIKE]: 100, [ActionType.FOLLOW]: 50 }
  },
  {
    id: Platform.Facebook,
    name: 'Facebook',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 25, [ActionType.LIKE]: 100 }
  },
  {
    id: Platform.YouTube,
    name: 'YouTube',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 5, [ActionType.LIKE]: 50 }
  },
  {
    id: Platform.GoogleBusiness,
    name: 'Google Business',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 10, [ActionType.REPLY]: 20 }
  },
  {
    id: Platform.Threads,
    name: 'Threads',
    enabled: true,
    connected: false,
    outage: false,
    supports: { [ActionType.POST]: true, [ActionType.LIKE]: true, [ActionType.REPLY]: true },
    rateLimits: { [ActionType.POST]: 30, [ActionType.LIKE]: 100 }
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

const RAW_MEDIA: MediaItem[] = [
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
    id: 'm2',
    name: 'Office_Tour.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    size: 2400000,
    createdAt: new Date().toISOString(),
    dimensions: '1080x1080',
    metadata: { width: 1080, height: 1080, duration: 0, sizeMB: 2.4, format: 'image/jpeg', aspectRatio: 1 },
    usageCount: 2,
    tags: ['office', 'culture'],
    collections: ['c2'],
    processingStatus: 'ready',
    governance: { status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() },
    aiMetadata: { generated: false, disclosureRequired: false },
    variants: [],
    performanceScore: 60,
    performanceTrend: 'stable'
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
    tags: ['ai', 'concept', 'NSFW'], // Adding NSFW to test blocking rules
    collections: [],
    processingStatus: 'ready',
    governance: { status: 'pending' },
    aiMetadata: { generated: true, tool: 'Midjourney', disclosureRequired: true },
    variants: [],
    performanceScore: 0,
    performanceTrend: 'stable'
  }
];

// Enrich Initial Media with Compatibility
const INITIAL_MEDIA = RAW_MEDIA.map(m => ({
    ...m,
    platformCompatibility: evaluateCompatibility(m)
}));

// ... (Helpers: generateThumbnail, extractMetadata, generateMockMetrics remain unchanged) ...
const generateThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const MAX_THUMB_SIZE = 400;

    if (file.type.startsWith('image')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, MAX_THUMB_SIZE / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Do not revoke here as the URL is used for the main item until page refresh
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => {
        resolve(''); // Fail gracefully
      };
      img.src = url;
    } else if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      
      const onSeeked = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, MAX_THUMB_SIZE / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        video.removeEventListener('seeked', onSeeked);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      video.onloadeddata = () => {
        // Seek to 0.5s or 1s to grab a frame
        video.currentTime = Math.min(1.0, video.duration > 0 ? video.duration / 2 : 0);
      };
      
      video.onseeked = onSeeked;
      
      video.onerror = () => {
        resolve(''); // Fail gracefully
      };
    } else {
      resolve('');
    }
  });
};

const extractMetadata = (file: File, url: string): Promise<MediaMetadata> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image')) {
      const img = new Image();
      img.onload = () => resolve({ 
          width: img.width, 
          height: img.height, 
          sizeMB: file.size / 1024 / 1024, 
          format: file.type, 
          duration: 0,
          aspectRatio: img.width / img.height
      });
      img.onerror = () => resolve({ width: 0, height: 0, sizeMB: file.size / 1024 / 1024, format: file.type, duration: 0, aspectRatio: 0 });
      img.src = url;
    } else if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve({ 
          width: video.videoWidth, 
          height: video.videoHeight, 
          sizeMB: file.size / 1024 / 1024, 
          format: file.type, 
          duration: video.duration || 0,
          aspectRatio: video.videoWidth / video.videoHeight
      });
      video.onerror = () => resolve({ width: 0, height: 0, sizeMB: file.size / 1024 / 1024, format: file.type, duration: 0, aspectRatio: 0 });
      video.src = url;
    } else {
        resolve({ width: 0, height: 0, sizeMB: file.size/1024/1024, format: file.type, duration: 0, aspectRatio: 0 });
    }
  });
};

const generateMockMetrics = (postId: string, mediaId: string, platform: string): PostPerformance => {
    const impressions = Math.floor(Math.random() * 49000) + 1000;
    const clicks = Math.floor(Math.random() * impressions * 0.04);
    const likes = Math.floor(Math.random() * impressions * 0.08);
    const comments = Math.floor(Math.random() * impressions * 0.02);
    const engagementRate = (likes + comments + clicks) / impressions;

    return {
        id: `perf-${Date.now()}`,
        postId,
        mediaId,
        platform,
        impressions,
        clicks,
        likes,
        comments,
        engagementRate,
        collectedAt: new Date().toISOString()
    };
}

// Hybrid Store Implementation
class HybridStore {
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[] = [];
  private media: MediaItem[] = [];
  private campaigns: Campaign[] = []; // Phase 10
  private activities: Record<string, BotActivity[]> = {};
  
  // Phase 6: Orchestration State
  private globalPolicy: GlobalPolicyConfig = {
      emergencyStop: false,
      quietHours: { enabled: true, startTime: '22:00', endTime: '06:00', timezone: 'UTC' },
      platformLimits: {} 
  };
  private dailyGlobalActions: Record<Platform, Record<ActionType, number>> = {
      [Platform.Twitter]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.LinkedIn]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.Instagram]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.Facebook]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.YouTube]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.GoogleBusiness]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
      [Platform.Threads]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 },
  };
  private actionHistory: BotActionRequest[] = []; // Simple in-memory history for conflict check
  
  // Phase 7: Live Execution State
  private botTimers: Map<string, any> = new Map();
  private dayRolloverTimer: any | null = null;

  // Phase 8: Adaptive Strategy State
  private adaptiveConfig: AdaptiveConfig = {
      mode: 'Balanced',
      autoOptimize: false,
      lastOptimization: new Date().toISOString()
  };
  private optimizationSuggestions: OptimizationSuggestion[] = [];

  // Phase 8.5: Platform Registry State
  private platforms: PlatformConfig[] = [];

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

    const savedUsers = localStorage.getItem('postmaster_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : []; 

    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : INITIAL_POSTS;

    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [];
    if (this.bots.length === 0) this.bots = DEFAULT_BOTS;

    const savedMedia = localStorage.getItem('postmaster_media');
    this.media = savedMedia ? JSON.parse(savedMedia) : INITIAL_MEDIA;

    const savedPlatforms = localStorage.getItem('postmaster_platforms');
    this.platforms = savedPlatforms ? JSON.parse(savedPlatforms) : DEFAULT_PLATFORMS;

    const savedCampaigns = localStorage.getItem('postmaster_campaigns');
    this.campaigns = savedCampaigns ? JSON.parse(savedCampaigns) : INITIAL_CAMPAIGNS;

    if (this.isSimulation) {
      this.startAutomation();
    }
  }

  // ... (existing private/helper methods) ...
  private get isSimulation(): boolean {
    return this.settings.demoMode;
  }
  
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

  // --- Campaign Management (Phase 10) ---

  async getCampaigns(): Promise<Campaign[]> {
      // Simulate live metric updates via Intelligence Layer
      this.campaigns = this.campaigns.map(c => {
          if (c.status === CampaignStatus.Active) {
              // 1. Simulate data movement (Metric tick)
              const updatedMetrics = { 
                  ...c.metrics, 
                  impressions: c.metrics.impressions + Math.floor(Math.random() * 50),
                  clicks: c.metrics.clicks + Math.floor(Math.random() * 2)
              };
              
              // 2. Simulate budget spend
              const updatedBudget = { ...c.budget, spent: c.budget.spent + Math.random() * 2 };

              // 3. Run Intelligence Engine
              const tempCampaign = { ...c, metrics: updatedMetrics, budget: updatedBudget };
              return enrichCampaignWithIntelligence(tempCampaign);
          }
          // For inactive campaigns, just ensure structure is consistent
          return enrichCampaignWithIntelligence(c);
      });
      return this.campaigns;
  }

  async addCampaign(campaign: Omit<Campaign, 'id'>): Promise<Campaign> {
      const newCampaign: Campaign = {
          ...campaign,
          id: `camp-${Date.now()}`,
          status: CampaignStatus.Active, // Auto-start for demo
          metrics: { impressions: 0, clicks: 0, conversions: 0, costPerResult: 0, roas: 0 },
          aiRecommendations: []
      };
      this.campaigns = [newCampaign, ...this.campaigns];
      this.saveState();
      return enrichCampaignWithIntelligence(newCampaign);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
      this.campaigns = this.campaigns.map(c => c.id === id ? { ...c, ...updates } : c);
      this.saveState();
      const updated = this.campaigns.find(c => c.id === id) as Campaign;
      return enrichCampaignWithIntelligence(updated);
  }

  async applyCampaignRecommendation(campaignId: string, recId: string) {
      const campaign = this.campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      const rec = campaign.aiRecommendations.find(r => r.id === recId);
      if (rec) {
          rec.status = 'applied';
          
          // Apply Logic Mock
          if (rec.type === 'budget') {
              campaign.budget.daily += 50; // Simple bump
          } else if (rec.type === 'platform') {
              if (!campaign.platforms.includes(Platform.Instagram)) {
                  campaign.platforms.push(Platform.Instagram);
              }
          }

          this.saveState();
      }
  }

  async dismissCampaignRecommendation(campaignId: string, recId: string) {
      const campaign = this.campaigns.find(c => c.id === campaignId);
      if (campaign) {
          const rec = campaign.aiRecommendations.find(r => r.id === recId);
          if (rec) rec.status = 'dismissed';
          this.saveState();
      }
  }

  // --- Platform Registry --- (Existing)
  getPlatforms(): PlatformConfig[] {
      return this.platforms;
  }

  togglePlatformEnabled(id: Platform) {
      this.platforms = this.platforms.map(p => 
          p.id === id ? { ...p, enabled: !p.enabled } : p
      );
      this.saveState();
  }

  setPlatformOutage(id: Platform, isOutage: boolean) {
      this.platforms = this.platforms.map(p => 
          p.id === id ? { ...p, outage: isOutage } : p
      );
      this.saveState();
  }

  async togglePlatformConnection(p: Platform): Promise<User> { 
      if (!this.isSimulation) return await api.togglePlatformConnection(p);

      const user = await this.getCurrentUser();
      if (!user) return {} as User;

      const currentStatus = user.connectedAccounts[p]?.connected || false;
      const newStatus = !currentStatus;

      user.connectedAccounts[p] = {
          connected: newStatus,
          handle: newStatus ? `@demo_${p.toLowerCase()}` : undefined,
          lastSync: newStatus ? new Date().toISOString() : undefined
      };
      
      this.users = this.users.map(u => u.id === user.id ? user : u);
      this.platforms = this.platforms.map(plat => 
          plat.id === p ? { ...plat, connected: newStatus } : plat
      );

      this.saveState();
      return user;
  }

  // --- Adaptive Strategy & Optimization --- (Existing)
  getAdaptiveConfig() { return this.adaptiveConfig; }
  setAdaptiveConfig(config: Partial<AdaptiveConfig>) {
      this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
      if (config.mode || config.autoOptimize) this.triggerOptimizationCycle();
  }
  getOptimizationSuggestions() { return this.optimizationSuggestions; }

  private triggerOptimizationCycle() {
      if (!this.isSimulation) return;
      this.bots.forEach(bot => {
          const suggestion = analyzePerformance(bot, this.adaptiveConfig.mode);
          if (suggestion) {
              this.optimizationSuggestions.unshift(suggestion);
              if (this.optimizationSuggestions.length > 20) this.optimizationSuggestions.pop();
              if (this.adaptiveConfig.autoOptimize) this.applyOptimization(suggestion);
          }
      });
  }

  private applyOptimization(suggestion: OptimizationSuggestion) {
      const botIndex = this.bots.findIndex(b => b.type === suggestion.botType);
      if (botIndex === -1) return;

      const bot = this.bots[botIndex];
      let rules = bot.config.rules as any;

      if (suggestion.parameter === 'Replies/Hour' && rules.maxRepliesPerHour) rules.maxRepliesPerHour = suggestion.newValue;
      else if (suggestion.parameter === 'Emoji Level' && rules.emojiLevel !== undefined) rules.emojiLevel = suggestion.newValue;
      else if (suggestion.parameter === 'Follow Rate' && rules.followRatePerHour) rules.followRatePerHour = suggestion.newValue;
      else if (suggestion.parameter === 'Tone Personality' && rules.personality) rules.personality.tone = suggestion.newValue;

      bot.config.rules = rules;
      this.bots[botIndex] = { ...bot };
      this.saveState();
      suggestion.applied = true;

      emitExecutionEvent({
          id: `opt-exec-${Date.now()}`,
          botId: suggestion.botType,
          botType: suggestion.botType,
          timestamp: Date.now(),
          platform: Platform.Twitter, 
          action: ActionType.OPTIMIZE,
          status: 'optimized',
          reason: `${suggestion.parameter} adjusted to ${suggestion.newValue}: ${suggestion.reason}`,
          riskLevel: 'low'
      });
  }

  // --- Self-Optimizing Bot Engine --- (Existing)
  private triggerLearningCycle(botType: BotType) {
      const botIndex = this.bots.findIndex(b => b.type === botType);
      if (botIndex === -1) return;
      const bot = this.bots[botIndex];

      if (!bot.learning?.enabled) return;

      const newEvents = analyzeBotPerformance(bot);
      const existingHistory = bot.optimizationHistory || [];
      const uniqueEvents = newEvents.filter(e => !existingHistory.some(h => h.reason === e.reason && h.status === 'pending'));
      
      if (uniqueEvents.length > 0) {
          bot.optimizationHistory = [...uniqueEvents, ...existingHistory];
          this.bots[botIndex] = { ...bot };
          this.saveState();
      }
  }

  applyLearningEvent(botType: BotType, eventId: string) {
      const botIndex = this.bots.findIndex(b => b.type === botType);
      if (botIndex === -1) return;
      const bot = this.bots[botIndex];

      const event = bot.optimizationHistory?.find(e => e.id === eventId);
      if (!event || event.status === 'applied') return;

      const rules = bot.config.rules as any;
      const fieldPath = event.field.split('.');
      if (fieldPath.length === 2) rules[fieldPath[0]][fieldPath[1]] = event.newValue;
      else rules[event.field] = event.newValue;

      event.status = 'applied';
      event.appliedAt = new Date().toISOString();
      
      this.bots[botIndex] = { ...bot };
      this.saveState();

      emitExecutionEvent({
          id: `learn-apply-${Date.now()}`,
          botId: botType,
          botType: botType,
          timestamp: Date.now(),
          platform: Platform.Twitter, 
          action: ActionType.OPTIMIZE,
          status: 'optimized',
          reason: `Applied Learning: ${event.field} -> ${event.newValue}`,
          riskLevel: 'low'
      });
  }

  ignoreLearningEvent(botType: BotType, eventId: string) {
      const botIndex = this.bots.findIndex(b => b.type === botType);
      if (botIndex === -1) return;
      const bot = this.bots[botIndex];
      const event = bot.optimizationHistory?.find(e => e.id === eventId);
      if (event) {
          event.status = 'rejected';
          this.bots[botIndex] = { ...bot };
          this.saveState();
      }
  }

  lockLearningField(botType: BotType, field: string) {
      const botIndex = this.bots.findIndex(b => b.type === botType);
      if (botIndex === -1) return;
      const bot = this.bots[botIndex];
      if (!bot.learning) return;
      if (!bot.learning.lockedFields.includes(field)) {
          bot.learning.lockedFields.push(field);
          this.bots[botIndex] = { ...bot };
          this.saveState();
      }
  }

  // --- Orchestration Methods --- (Existing)
  getGlobalPolicy(): GlobalPolicyConfig {
      const dynamicLimits: any = {};
      this.platforms.forEach(p => { dynamicLimits[p.id] = p.rateLimits; });
      return { ...this.globalPolicy, platformLimits: dynamicLimits };
  }

  updateGlobalPolicy(config: Partial<GlobalPolicyConfig>) {
      this.globalPolicy = { ...this.globalPolicy, ...config };
      if (this.globalPolicy.emergencyStop) this.stopAutomation();
      else if (config.emergencyStop === false) this.startAutomation();
  }

  getDailyGlobalActions() { return this.dailyGlobalActions; }

  checkGlobalPermissions(botType: BotType, platform: Platform, actionType: ActionType, targetId?: string): { allowed: boolean, reason?: string } {
      const req: BotActionRequest = { botType, platform, actionType, targetId, timestamp: new Date().toISOString() };
      const platformConfig = this.platforms.find(p => p.id === platform);
      
      if (!platformConfig) return { allowed: false, reason: `Unknown platform: ${platform}` };
      if (!platformConfig.enabled) return { allowed: false, reason: `Blocked: Platform ${platform} is currently PAUSED or disabled.` };
      if (!platformConfig.connected) return { allowed: false, reason: `Blocked: Platform ${platform} is NOT CONNECTED. Check integrations.` };
      if (platformConfig.outage) return { allowed: false, reason: `Blocked: Platform ${platform} reporting API OUTAGE.` };
      if (!platformConfig.supports[actionType]) return { allowed: false, reason: `Blocked: Action '${actionType}' is not supported on ${platform}.` };

      const dynamicPolicy = this.getGlobalPolicy();
      const policyResult = OrchestrationPolicy.checkGlobalPolicy(dynamicPolicy, this.dailyGlobalActions, req);
      if (!policyResult.allowed) {
          logOrchestrationEvent({ ...req, status: 'BLOCKED', reason: policyResult.reason || 'Blocked by Policy' });
          return { allowed: false, reason: policyResult.reason };
      }

      const conflictResult = BotCoordinator.checkConflicts(this.actionHistory, req);
      if (!conflictResult.allowed) {
          logOrchestrationEvent({ ...req, status: 'DEFERRED', reason: conflictResult.reason || 'Deferred by Conflict' });
          return { allowed: false, reason: conflictResult.reason };
      }

      logOrchestrationEvent({ ...req, status: 'APPROVED', reason: 'Passed all checks' });
      return { allowed: true };
  }

  incrementGlobalUsage(platform: Platform, actionType: ActionType, botType: BotType, targetId?: string) {
      if (!this.dailyGlobalActions[platform]) this.dailyGlobalActions[platform] = { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0, [ActionType.OPTIMIZE]: 0 };
      this.dailyGlobalActions[platform][actionType] = (this.dailyGlobalActions[platform][actionType] || 0) + 1;
      this.actionHistory.push({ botType, platform, actionType, targetId, timestamp: new Date().toISOString() });
      if (this.actionHistory.length > 500) this.actionHistory.shift();
  }

  // --- Automation Logic --- (Existing)
  private startAutomation() {
    this.bots.forEach(bot => {
      if (bot.enabled && !this.globalPolicy.emergencyStop) this.startBotExecution(bot.type);
    });
    if (!this.dayRolloverTimer) {
        this.dayRolloverTimer = setInterval(() => {
            this.resetDailyQuotas();
            this.triggerOptimizationCycle();
        }, 5 * 60 * 1000); 
    }
  }

  private stopAutomation() {
    this.bots.forEach(bot => this.stopBotExecution(bot.type));
    if (this.dayRolloverTimer) {
        clearInterval(this.dayRolloverTimer);
        this.dayRolloverTimer = null;
    }
  }

  private resetDailyQuotas() {
      Object.keys(this.dailyGlobalActions).forEach(p => {
          Object.keys(this.dailyGlobalActions[p as Platform]!).forEach(a => {
              this.dailyGlobalActions[p as Platform]![a as ActionType] = 0;
          });
      });
  }

  private startBotExecution(botType: BotType) {
      if (this.botTimers.has(botType)) return;
      const bot = this.bots.find(b => b.type === botType);
      if (!bot) return;

      const profile = getStrategyProfile(this.adaptiveConfig.mode);
      let intervalMs = Math.floor(Math.random() * 20000) + 10000;
      if (profile.mode === 'Aggressive') intervalMs = intervalMs * 0.5;
      if (profile.mode === 'Conservative') intervalMs = intervalMs * 1.5;

      const timer = setInterval(() => { this.executeBotCycle(botType); }, intervalMs);
      this.botTimers.set(botType, timer);
  }

  private stopBotExecution(botType: BotType) {
      const timer = this.botTimers.get(botType);
      if (timer) { clearInterval(timer); this.botTimers.delete(botType); }
  }

  private async executeBotCycle(botType: BotType) {
      if (this.globalPolicy.emergencyStop) return;
      const bot = this.bots.find(b => b.type === botType);
      if (!bot || !bot.enabled) return;

      let actionType = ActionType.ANALYZE;
      let platform = Platform.Twitter;
      const availablePlatforms = this.platforms.filter(p => p.connected && p.enabled && !p.outage);
      if (availablePlatforms.length === 0) return;
      const targetPlatform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)].id;

      switch(botType) {
          case BotType.Creator: 
              actionType = ActionType.POST; 
              const allowed = bot.config.targetPlatforms || [];
              if (allowed.length > 0) {
                  const intersection = allowed.filter(p => availablePlatforms.some(ap => ap.id === p));
                  if (intersection.length > 0) platform = intersection[Math.floor(Math.random() * intersection.length)];
              } else { platform = targetPlatform; }
              break;
          case BotType.Engagement: actionType = Math.random() > 0.5 ? ActionType.LIKE : ActionType.REPLY; platform = targetPlatform; break;
          case BotType.Growth: actionType = ActionType.FOLLOW; platform = targetPlatform; break;
          case BotType.Finder: actionType = ActionType.ANALYZE; platform = targetPlatform; break;
      }

      let selectedAsset: MediaItem | null = null;
      if (botType === BotType.Creator) {
          const selection = this.selectAssetForBot(bot, new Date());
          if (selection.selected) selectedAsset = selection.selected;
          else {
              const reason = selection.trace.find(t => t.status === 'rejected')?.reason || 'No eligible assets';
              emitExecutionEvent({ id: `exec-${Date.now()}`, botId: botType, botType, timestamp: Date.now(), platform, action: actionType, status: 'skipped', reason, riskLevel: 'low' });
              return;
          }
      }

      const check = this.checkGlobalPermissions(botType, platform, actionType, selectedAsset?.id || 'sim-target');
      if (!check.allowed) {
          emitExecutionEvent({ id: `exec-${Date.now()}`, botId: botType, botType, timestamp: Date.now(), platform, action: actionType, status: 'blocked', assetId: selectedAsset?.id, assetName: selectedAsset?.name, reason: check.reason, riskLevel: 'medium' });
          return;
      }

      if (selectedAsset) { selectedAsset.lastUsedAt = new Date().toISOString(); selectedAsset.usageCount = (selectedAsset.usageCount || 0) + 1; }
      this.incrementGlobalUsage(platform, actionType, botType, selectedAsset?.id);

      let outcomeScore = 50 + Math.random() * 50;
      if (this.adaptiveConfig.mode === 'Aggressive') outcomeScore = Math.random() * 100;
      
      recordLearning({ platform, actionType, context: 'General', outcomeScore, timestamp: Date.now() });
      this.triggerLearningCycle(botType);

      emitExecutionEvent({ id: `exec-${Date.now()}`, botId: botType, botType, timestamp: Date.now(), platform, action: actionType, status: 'executed', assetId: selectedAsset?.id, assetName: selectedAsset?.name, riskLevel: botType === BotType.Growth ? 'medium' : 'low' });
  }

  private selectAssetForBot(bot: BotConfig, virtualTime: Date, usageHistoryOverride?: Record<string, string>): { selected: MediaItem | null, trace: AssetDecision[] } {
      const policyCheck = this.checkGlobalPermissions(bot.type, Platform.Twitter, ActionType.POST);
      if (!policyCheck.allowed) return { selected: null, trace: [{ assetId: 'GLOBAL', assetName: 'Orchestrator', status: 'rejected', reason: policyCheck.reason }] };

      const trace: AssetDecision[] = [];
      const candidates = RuleEngine.filterAssetsByRules(this.media, bot);
      
      const eligibleAssets = candidates.filter(asset => {
          let decision: AssetDecision = { assetId: asset.id, assetName: asset.name, status: 'rejected', score: 0 };
          if (asset.governance.status !== 'approved') { decision.reason = `Governance Status is '${asset.governance.status}' (Must be approved)`; trace.push(decision); return false; }

          const lastUsedIso = usageHistoryOverride?.[asset.id] || asset.lastUsedAt;
          if (lastUsedIso) {
              const lastUsedDate = new Date(lastUsedIso);
              const cooldownDays = 3; const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
              const diff = virtualTime.getTime() - lastUsedDate.getTime();
              if (diff < cooldownMs) { decision.reason = `Cooldown Active (${Math.ceil((cooldownMs - diff) / (1000 * 60 * 60))}h remaining)`; trace.push(decision); return false; }
          }

          const perfEvents = getPerformanceForMedia(asset.id);
          const { isFatigued, reason } = detectFatigue(asset, perfEvents);
          if (isFatigued) { decision.status = 'rejected'; decision.reason = `Fatigue: ${reason}`; trace.push(decision); return false; }

          const perfScore = asset.performanceScore !== undefined ? asset.performanceScore : 50;
          decision.score = perfScore; decision.status = 'accepted'; trace.push(decision); return true;
      });

      eligibleAssets.sort((a, b) => (b.performanceScore || 50) - (a.performanceScore || 50));
      const topCandidates = eligibleAssets.slice(0, 3);
      const selected = topCandidates.length > 0 ? topCandidates[Math.floor(Math.random() * topCandidates.length)] : null;
      return { selected, trace };
  }

  // --- CRUD Proxies ---
  async getCurrentUser(): Promise<User | undefined> {
    if (!this.isSimulation) { const users = await api.getUsers(); return users[0]; }
    return { id: '1', name: 'Admin', email: 'admin@test.com', role: UserRole.Admin, status: UserStatus.Active, lastActive: 'Now', connectedAccounts: {} };
  }
  async getPosts(): Promise<Post[]> { if (!this.isSimulation) return api.getPosts(); return this.posts; }
  async addPost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.addPost(post);
    if (post.status === PostStatus.Published) {
        const check = this.checkGlobalPermissions(BotType.Creator, post.platforms[0] || Platform.Twitter, ActionType.POST);
        if (!check.allowed) throw new Error(check.reason);
        this.incrementGlobalUsage(post.platforms[0] || Platform.Twitter, ActionType.POST, BotType.Creator);
    }
    this.posts = [post, ...this.posts];
    if (post.mediaUrl && post.status === 'Published') {
        const media = this.media.find(m => m.url === post.mediaUrl);
        if (media) {
            media.lastUsedAt = new Date().toISOString(); media.usageCount = (media.usageCount || 0) + 1;
            if (post.mediaId) { const perf = generateMockMetrics(post.id, post.mediaId, post.platforms[0] || 'Twitter'); logPerformance(perf); this.updateMediaScore(post.mediaId); }
        }
    }
    this.saveState();
    return post;
  }
  async updatePost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.updatePost(post);
    const oldPost = this.posts.find(p => p.id === post.id);
    if (oldPost && oldPost.status !== 'Published' && post.status === 'Published') {
        const check = this.checkGlobalPermissions(BotType.Creator, post.platforms[0] || Platform.Twitter, ActionType.POST);
        if (!check.allowed) throw new Error(`Orchestration Block: ${check.reason}`);
        this.incrementGlobalUsage(post.platforms[0] || Platform.Twitter, ActionType.POST, BotType.Creator);
        if (post.mediaId) { const perf = generateMockMetrics(post.id, post.mediaId, post.platforms[0] || 'Twitter'); logPerformance(perf); this.updateMediaScore(post.mediaId); }
    }
    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.saveState();
    return post;
  }
  private updateMediaScore(mediaId: string) {
      const events = getPerformanceForMedia(mediaId);
      const { score, trend } = calculateCreativeScore(events);
      this.media = this.media.map(m => { if (m.id === mediaId) { return { ...m, performanceScore: score, performanceTrend: trend }; } return m; });
      this.saveState();
  }
  async deletePost(id: string): Promise<void> { if (!this.isSimulation) return api.deletePost(id); this.posts = this.posts.filter(p => p.id !== id); this.saveState(); }
  async getBots(): Promise<BotConfig[]> {
    if (!this.isSimulation) { try { const remoteBots = await api.getBots(); if (Array.isArray(remoteBots) && remoteBots.length > 0) return remoteBots; } catch (error) { console.warn("[HybridStore] API error, falling back to local defaults.", error); } return DEFAULT_BOTS; }
    if (this.bots.length === 0) { this.bots = DEFAULT_BOTS; this.saveState(); } return this.bots;
  }
  async toggleBot(type: BotType): Promise<BotConfig[]> {
     if (!this.isSimulation) { try { return await api.toggleBot(type); } catch (e) { console.error("Failed to toggle bot in prod:", e); return DEFAULT_BOTS; } }
     this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
     const updatedBot = this.bots.find(b => b.type === type);
     if (updatedBot) { if (updatedBot.enabled) this.startBotExecution(type); else this.stopBotExecution(type); }
     this.saveState(); return this.bots;
  }
  async updateBot(bot: BotConfig): Promise<BotConfig[]> { if (!this.isSimulation) { try { return await api.updateBot(bot); } catch (e) { console.error("Failed to update bot in prod:", e); return DEFAULT_BOTS; } } this.bots = this.bots.map(b => b.type === bot.type ? bot : b); this.saveState(); return this.bots; }
  async simulateBot(type: BotType): Promise<BotActivity[]> { this.executeBotCycle(type); return this.activities[type] || []; }
  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    if (!this.isSimulation) { try { return await api.getBotActivity(type); } catch (e) { console.warn("Failed to fetch activity:", e); return []; } }
    if (!this.activities[type]) { this.activities[type] = []; } return this.activities[type];
  }
  async getStats(): Promise<DashboardStats> { try { return !this.isSimulation ? await api.getStats() : { totalPosts: this.posts.length, totalReach: 12500, engagementRate: 4.2, activeBots: this.bots.filter(b => b.enabled).length }; } catch (e) { return { totalPosts: 0, totalReach: 0, engagementRate: 0, activeBots: 0 }; } }
  async getSettings(): Promise<UserSettings> { try { return !this.isSimulation ? await api.getSettings() : this.settings; } catch (e) { return this.settings; } }
  async saveSettings(s: UserSettings): Promise<UserSettings> { if (!this.isSimulation) return api.saveSettings(s); this.settings = s; this.saveState(); return s; }
  async getUsers(): Promise<User[]> { try { return !this.isSimulation ? await api.getUsers() : this.users; } catch (e) { return this.users; } }
  async addUser(u: any): Promise<User[]> { if (!this.isSimulation) return api.addUser(u); this.users.push({ ...u, id: Date.now().toString() }); this.saveState(); return this.users; }
  async updateUser(id: string, u: any): Promise<User[]> { if (!this.isSimulation) return api.updateUser(id, u); this.users = this.users.map(user => user.id === id ? { ...user, ...u } : user); this.saveState(); return this.users; }
  async getMedia(): Promise<MediaItem[]> { try { return !this.isSimulation ? await api.getMedia() : this.media; } catch (e) { return this.media; } }
  async uploadMedia(f: File): Promise<MediaItem> { 
      if (!this.isSimulation) return api.uploadMedia(f);
      const url = URL.createObjectURL(f); const id = Date.now().toString();
      const newItem: MediaItem = { id, name: f.name, type: f.type.startsWith('video') ? 'video' : 'image', url: url, thumbnailUrl: f.type.startsWith('image') ? url : undefined, size: f.size, createdAt: new Date().toISOString(), dimensions: 'Pending...', processingStatus: 'uploading', usageCount: 0, tags: [f.type.startsWith('video') ? 'video' : 'image'], governance: { status: 'pending' }, aiMetadata: { generated: false, disclosureRequired: false }, variants: [], performanceScore: 50, performanceTrend: 'stable' };
      this.media = [newItem, ...this.media]; this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: newItem.id, action: 'UPLOAD', actor: 'Current User', timestamp: new Date().toISOString() }); this.processMediaInBackground(newItem, f); return newItem;
  }
  
  // New AI Generation Method
  async generateAsset(prompt: string, type: 'image' | 'video'): Promise<MediaItem> {
    if (!this.isSimulation) throw new Error("Generative features currently available in Simulation Mode only.");

    // 1. Create a placeholder immediately for UI responsiveness
    const id = `gen-${Date.now()}`;
    // Using Pollinations.ai for deterministic but dynamic image generation
    const seed = Math.floor(Math.random() * 1000);
    const mockUrl = type === 'image'
        ? `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&nologo=true`
        : `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4`; 

    const newItem: MediaItem = {
        id,
        name: `${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_${seed}.${type === 'image' ? 'jpg' : 'mp4'}`,
        type,
        url: mockUrl,
        thumbnailUrl: type === 'image' ? mockUrl : 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        size: 1024 * 1024 * (type === 'image' ? 2 : 15), 
        createdAt: new Date().toISOString(),
        dimensions: type === 'image' ? '1024x1024' : '1920x1080',
        processingStatus: 'ready',
        usageCount: 0,
        tags: ['ai-generated', type, ...prompt.split(' ').slice(0,3)],
        governance: { status: 'approved' }, 
        aiMetadata: {
            generated: true,
            tool: 'Pollinations AI (Mock)',
            disclosureRequired: true,
            originalPrompt: prompt
        },
        variants: [],
        performanceScore: 50,
        performanceTrend: 'stable',
        // Mark compatibility as good immediately for the demo
        platformCompatibility: type === 'image' ? { 
            'Twitter': { compatible: true, issues: [] },
            'Instagram': { compatible: true, issues: [] },
            'LinkedIn': { compatible: true, issues: [] }
        } : undefined
    };

    // 2. Add to store
    this.media = [newItem, ...this.media];
    this.saveState();

    // 3. Log Audit
    logAudit({
        id: `audit-${Date.now()}`,
        mediaId: newItem.id,
        action: 'UPLOAD',
        actor: 'AI Generator',
        timestamp: new Date().toISOString(),
        reason: `Generated from prompt: "${prompt}"`
    });

    return newItem;
  }

  private async processMediaInBackground(item: MediaItem, file: File) {
      await new Promise(r => setTimeout(r, 800)); this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'processing' } : m); this.saveState();
      try { await new Promise(r => setTimeout(r, 1200 + Math.random() * 800)); const [metadata, thumbnailUrl] = await Promise.all([extractMetadata(file, item.url), generateThumbnail(file)]); const mediaWithMeta = { ...item, metadata }; const compatibility = evaluateCompatibility(mediaWithMeta); this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'ready', dimensions: `${metadata.width}x${metadata.height}`, metadata, thumbnailUrl: thumbnailUrl || (m.type === 'image' ? m.url : undefined), platformCompatibility: compatibility } : m); this.saveState(); } catch (error) { console.error("Media processing failed", error); this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'failed' } : m); this.saveState(); }
  }
  async deleteMedia(id: string): Promise<MediaItem[]> { if (!this.isSimulation) return api.deleteMedia(id); const item = this.media.find(m => m.id === id); if (item?.usageCount && item.usageCount > 0) { throw new Error("Cannot delete asset currently in use by active campaigns."); } this.media = this.media.filter(m => m.id !== id); this.saveState(); return this.media; }
  async approveMedia(id: string, user: string): Promise<MediaItem[]> { if (!this.isSimulation) return this.media; this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'approved', approvedBy: user, approvedAt: new Date().toISOString() } } : m); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: id, action: 'APPROVED', actor: user, timestamp: new Date().toISOString() }); return this.media; }
  async rejectMedia(id: string, reason: string): Promise<MediaItem[]> { if (!this.isSimulation) return this.media; this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'rejected', rejectionReason: reason } } : m); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: id, action: 'RESTRICTED', actor: 'Admin', timestamp: new Date().toISOString(), reason: reason }); return this.media; }
  async resetMedia(id: string): Promise<MediaItem[]> { if (!this.isSimulation) return this.media; this.media = this.media.map(m => m.id === id ? { ...m, governance: { status: 'pending' } } : m); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: id, action: 'RESET_TO_DRAFT', actor: 'Admin', timestamp: new Date().toISOString() }); return this.media; }
  async createVariant(id: string, platform: string): Promise<MediaVariant> { if (!this.isSimulation) return {} as MediaVariant; const item = this.media.find(m => m.id === id); if (!item) throw new Error("Media not found"); const variant = await generateVariant(item, platform); this.media = this.media.map(m => { if (m.id === id) { const variants = m.variants || []; const filtered = variants.filter(v => v.platform !== platform); return { ...m, variants: [...filtered, variant] }; } return m; }); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: id, action: 'VARIANT_GENERATED', actor: 'AI Optimization Engine', timestamp: new Date().toISOString(), reason: `Auto-generated for ${platform}` }); return variant; }
  async createEnhancedVariant(id: string, type: EnhancementType): Promise<MediaVariant> { if (!this.isSimulation) return {} as MediaVariant; const item = this.media.find(m => m.id === id); if (!item) throw new Error("Media not found"); const variant = await applyEnhancement(item, type); this.media = this.media.map(m => { if (m.id === id) { const variants = m.variants || []; return { ...m, variants: [variant, ...variants] }; } return m; }); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: id, action: 'ENHANCEMENT_APPLIED', actor: 'AI Enhancement Engine', timestamp: new Date().toISOString(), reason: `Applied ${type.replace('_', ' ')}` }); return variant; }
  async deleteVariant(parentId: string, variantId: string): Promise<void> { if (!this.isSimulation) return; this.media = this.media.map(m => { if (m.id === parentId && m.variants) { return { ...m, variants: m.variants.filter(v => v.id !== variantId) }; } return m; }); this.saveState(); logAudit({ id: Date.now().toString() + Math.random(), mediaId: parentId, action: 'VARIANT_DELETED', actor: 'Current User', timestamp: new Date().toISOString() }); }
  async createOptimizedCopy(id: string, v: string): Promise<MediaItem> { return {} as MediaItem; }
  async getPlatformAnalytics(p: any): Promise<PlatformAnalytics> { return { platform: p, summary: { followers: 1200, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 }, history: Array.from({length: 7}, (_, i) => ({ date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(), followers: 1200 + i*10, impressions: 4000 + Math.random()*1000, engagement: 200 + Math.random()*50 })) }; }
  
  // Method missing in interface but used in pages
  runBotForecast = async () => ({ timeline: [], risks: [], summary: { totalCycles: 0, successful: 0, skipped: 0 } });
}

export const store = new HybridStore();
