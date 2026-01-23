
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, User, UserRole, UserStatus, MediaItem, BotActivity, ActivityStatus, ActionType, MediaMetadata, SimulationReport, SimulationCycle, AssetDecision, MediaAuditEvent, MediaVariant, EnhancementType, PostPerformance, FinderBotRules, GrowthBotRules, EngagementBotRules, CreatorBotRules, GlobalPolicyConfig, BotActionRequest, OrchestrationLogEntry, BotExecutionEvent } from '../types';
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

// ... (Thumbnail and Metadata helpers remain unchanged) ...
// Generates a thumbnail Data URL for videos (poster frame) or images (resized)
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
  private activities: Record<string, BotActivity[]> = {};
  
  // Phase 6: Orchestration State
  private globalPolicy: GlobalPolicyConfig = {
      emergencyStop: false,
      quietHours: { enabled: true, startTime: '22:00', endTime: '06:00', timezone: 'UTC' },
      platformLimits: {
          [Platform.Twitter]: { [ActionType.POST]: 50, [ActionType.LIKE]: 100, [ActionType.FOLLOW]: 20 },
          [Platform.LinkedIn]: { [ActionType.POST]: 10, [ActionType.LIKE]: 50 },
          [Platform.Instagram]: { [ActionType.POST]: 15, [ActionType.LIKE]: 100 },
      }
  };
  private dailyGlobalActions: Record<Platform, Record<ActionType, number>> = {
      [Platform.Twitter]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.LinkedIn]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.Instagram]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.Facebook]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.YouTube]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.GoogleBusiness]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
      [Platform.Threads]: { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 },
  };
  private actionHistory: BotActionRequest[] = []; // Simple in-memory history for conflict check
  
  // Phase 7: Live Execution State
  private botTimers: Map<string, NodeJS.Timeout> = new Map();
  private dayRolloverTimer: NodeJS.Timeout | null = null;

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

    const savedMedia = localStorage.getItem('postmaster_media');
    this.media = savedMedia ? JSON.parse(savedMedia) : INITIAL_MEDIA;

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
      }
  }

  // --- Phase 6: Orchestration Methods ---
  
  getGlobalPolicy(): GlobalPolicyConfig {
      return this.globalPolicy;
  }

  updateGlobalPolicy(config: Partial<GlobalPolicyConfig>) {
      this.globalPolicy = { ...this.globalPolicy, ...config };
      
      // Phase 7: Emergency Stop Logic
      if (this.globalPolicy.emergencyStop) {
          this.stopAutomation();
      } else if (config.emergencyStop === false) {
          // Restart automation if emergency stop is cleared
          this.startAutomation();
      }
  }

  getDailyGlobalActions() {
      return this.dailyGlobalActions;
  }

  // Central Orchestration Check
  checkGlobalPermissions(botType: BotType, platform: Platform, actionType: ActionType, targetId?: string): { allowed: boolean, reason?: string } {
      const req: BotActionRequest = {
          botType,
          platform,
          actionType,
          targetId,
          timestamp: new Date().toISOString()
      };

      // 1. Policy Check
      const policyResult = OrchestrationPolicy.checkGlobalPolicy(this.globalPolicy, this.dailyGlobalActions, req);
      if (!policyResult.allowed) {
          logOrchestrationEvent({ ...req, status: 'BLOCKED', reason: policyResult.reason || 'Blocked by Policy' });
          return { allowed: false, reason: policyResult.reason };
      }

      // 2. Conflict Check
      const conflictResult = BotCoordinator.checkConflicts(this.actionHistory, req);
      if (!conflictResult.allowed) {
          logOrchestrationEvent({ ...req, status: 'DEFERRED', reason: conflictResult.reason || 'Deferred by Conflict' });
          return { allowed: false, reason: conflictResult.reason };
      }

      // 3. Approved
      logOrchestrationEvent({ ...req, status: 'APPROVED', reason: 'Passed all checks' });
      return { allowed: true };
  }

  // Call this after action execution to update counters
  incrementGlobalUsage(platform: Platform, actionType: ActionType, botType: BotType, targetId?: string) {
      if (!this.dailyGlobalActions[platform]) this.dailyGlobalActions[platform] = { [ActionType.POST]: 0, [ActionType.LIKE]: 0, [ActionType.REPLY]: 0, [ActionType.FOLLOW]: 0, [ActionType.UNFOLLOW]: 0, [ActionType.ANALYZE]: 0 };
      
      this.dailyGlobalActions[platform][actionType] = (this.dailyGlobalActions[platform][actionType] || 0) + 1;
      
      this.actionHistory.push({
          botType,
          platform,
          actionType,
          targetId,
          timestamp: new Date().toISOString()
      });
      // Keep history manageable
      if (this.actionHistory.length > 500) this.actionHistory.shift();
  }

  // --- Phase 7: Live Execution Logic ---

  private startAutomation() {
    console.log("[MockStore] Starting automation loop...");
    // Start bot loops
    this.bots.forEach(bot => {
      if (bot.enabled && !this.globalPolicy.emergencyStop) {
        this.startBotExecution(bot.type);
      }
    });

    // Start Day Rollover Timer (every 5 minutes for demo)
    if (!this.dayRolloverTimer) {
        this.dayRolloverTimer = setInterval(() => {
            console.log("[MockStore] Day Rollover - Resetting quotas.");
            this.resetDailyQuotas();
        }, 5 * 60 * 1000); 
    }
  }

  private stopAutomation() {
    console.log("[MockStore] Stopping automation loop...");
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
      if (this.botTimers.has(botType)) return; // Already running

      const bot = this.bots.find(b => b.type === botType);
      if (!bot) return;

      // Random interval between 10s and 30s to simulate organic behavior
      const intervalMs = Math.floor(Math.random() * 20000) + 10000;

      const timer = setInterval(() => {
          this.executeBotCycle(botType);
      }, intervalMs);

      this.botTimers.set(botType, timer);
  }

  private stopBotExecution(botType: BotType) {
      const timer = this.botTimers.get(botType);
      if (timer) {
          clearInterval(timer);
          this.botTimers.delete(botType);
      }
  }

  private async executeBotCycle(botType: BotType) {
      // 1. Safety Check (Redundant but safe)
      if (this.globalPolicy.emergencyStop) return;

      const bot = this.bots.find(b => b.type === botType);
      if (!bot || !bot.enabled) return;

      // 2. Determine Probable Action
      let actionType = ActionType.ANALYZE;
      let platform = Platform.Twitter;
      
      switch(botType) {
          case BotType.Creator: 
              actionType = ActionType.POST; 
              platform = bot.config.targetPlatforms?.[0] || Platform.Twitter;
              break;
          case BotType.Engagement: 
              actionType = Math.random() > 0.5 ? ActionType.LIKE : ActionType.REPLY; 
              break;
          case BotType.Growth: 
              actionType = ActionType.FOLLOW; 
              break;
          case BotType.Finder: 
              actionType = ActionType.ANALYZE; 
              break;
      }

      // 3. Asset Selection (if applicable)
      let selectedAsset: MediaItem | null = null;
      if (botType === BotType.Creator) {
          const selection = this.selectAssetForBot(bot, new Date());
          if (selection.selected) {
              selectedAsset = selection.selected;
          } else {
              // Emit Skip Event
              const reason = selection.trace.find(t => t.status === 'rejected')?.reason || 'No eligible assets';
              emitExecutionEvent({
                  id: `exec-${Date.now()}`,
                  botId: botType,
                  botType: botType,
                  timestamp: Date.now(),
                  platform,
                  action: actionType,
                  status: 'skipped',
                  reason: reason,
                  riskLevel: 'low'
              });
              return;
          }
      }

      // 4. Global Policy Check
      const check = this.checkGlobalPermissions(botType, platform, actionType, selectedAsset?.id || 'sim-target');
      
      if (!check.allowed) {
          emitExecutionEvent({
              id: `exec-${Date.now()}`,
              botId: botType,
              botType: botType,
              timestamp: Date.now(),
              platform,
              action: actionType,
              status: 'blocked',
              assetId: selectedAsset?.id,
              assetName: selectedAsset?.name,
              reason: check.reason,
              riskLevel: 'medium'
          });
          return;
      }

      // 5. Execute Action (Simulation)
      // For Creator bot, we don't actually create a post record here to avoid cluttering the feed endlessly, 
      // but we simulate the "Action" taking place.
      
      // Update Asset Last Used
      if (selectedAsset) {
          selectedAsset.lastUsedAt = new Date().toISOString();
          selectedAsset.usageCount = (selectedAsset.usageCount || 0) + 1;
      }

      // Update Daily Quota
      this.incrementGlobalUsage(platform, actionType, botType, selectedAsset?.id);

      // 6. Emit Success Event
      emitExecutionEvent({
          id: `exec-${Date.now()}`,
          botId: botType,
          botType: botType,
          timestamp: Date.now(),
          platform,
          action: actionType,
          status: 'executed',
          assetId: selectedAsset?.id,
          assetName: selectedAsset?.name,
          riskLevel: botType === BotType.Growth ? 'medium' : 'low'
      });
  }

  // --- Core Asset Selection Logic (Shared) ---
  // This function is deterministic and used by both live bot (via worker shim) and simulation engine
  private selectAssetForBot(
    bot: BotConfig,
    virtualTime: Date,
    usageHistoryOverride?: Record<string, string> // Map of assetId -> ISO date string
  ): { selected: MediaItem | null, trace: AssetDecision[] } {
      
      // Phase 6: Inject Global Policy Check into selection logic (Early abort)
      const policyCheck = this.checkGlobalPermissions(bot.type, Platform.Twitter, ActionType.POST); // Assume generic POST for selection
      if (!policyCheck.allowed) {
          return { selected: null, trace: [{ assetId: 'GLOBAL', assetName: 'Orchestrator', status: 'rejected', reason: policyCheck.reason }] };
      }

      const trace: AssetDecision[] = [];
      
      // 1. RULES FILTERING (NEW PHASE 5B Integration)
      // Apply strict rules *before* performance scoring
      const candidates = RuleEngine.filterAssetsByRules(this.media, bot);
      
      const eligibleAssets = candidates.filter(asset => {
          let decision: AssetDecision = { 
              assetId: asset.id, 
              assetName: asset.name, 
              status: 'rejected', 
              score: 0 
          };

          // 2. Governance Check
          if (asset.governance.status !== 'approved') {
              decision.reason = `Governance Status is '${asset.governance.status}' (Must be approved)`;
              trace.push(decision);
              return false;
          }

          // 3. Cooldown Check
          const lastUsedIso = usageHistoryOverride?.[asset.id] || asset.lastUsedAt;
          if (lastUsedIso) {
              const lastUsedDate = new Date(lastUsedIso);
              const cooldownDays = 3; 
              const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
              const diff = virtualTime.getTime() - lastUsedDate.getTime();
              
              if (diff < cooldownMs) {
                  const hoursRemaining = Math.ceil((cooldownMs - diff) / (1000 * 60 * 60));
                  decision.reason = `Cooldown Active (${hoursRemaining}h remaining)`;
                  trace.push(decision);
                  return false;
              }
          }

          // 4. Fatigue Check
          const perfEvents = getPerformanceForMedia(asset.id);
          const { isFatigued, reason } = detectFatigue(asset, perfEvents);
          
          if (isFatigued) {
             decision.status = 'rejected';
             decision.reason = `Fatigue: ${reason}`;
             trace.push(decision);
             return false;
          }

          // 5. Scoring
          const perfScore = asset.performanceScore !== undefined ? asset.performanceScore : 50;
          decision.score = perfScore;
          decision.status = 'accepted';
          trace.push(decision);
          return true;
      });

      // Sort by score descending (Performance-based selection)
      eligibleAssets.sort((a, b) => (b.performanceScore || 50) - (a.performanceScore || 50));

      // Select top candidate
      const topCandidates = eligibleAssets.slice(0, 3);
      const selected = topCandidates.length > 0 
          ? topCandidates[Math.floor(Math.random() * topCandidates.length)] 
          : null;

      return { selected, trace };
  }

  // --- Forecast Engine ---
  async runBotForecast(botType: BotType, mode: 'single' | 'day' | 'stress'): Promise<SimulationReport> {
      // Stub implementation for compilation - logic is mostly in BotManager UI simulation logic for now
      return { timeline: [], risks: [], summary: { totalCycles: 0, successful: 0, skipped: 0 } };
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
    
    // Check Global Policy before allowing post creation if it's immediate
    if (post.status === PostStatus.Published) {
        const check = this.checkGlobalPermissions(BotType.Creator, post.platforms[0] || Platform.Twitter, ActionType.POST);
        if (!check.allowed) {
            throw new Error(check.reason);
        }
        this.incrementGlobalUsage(post.platforms[0] || Platform.Twitter, ActionType.POST, BotType.Creator);
    }

    this.posts = [post, ...this.posts];
    
    // If post uses media, update its lastUsedAt in real store
    if (post.mediaUrl && post.status === 'Published') {
        const media = this.media.find(m => m.url === post.mediaUrl);
        if (media) {
            media.lastUsedAt = new Date().toISOString();
            media.usageCount = (media.usageCount || 0) + 1;
            
            // Generate Mock Performance Data Immediately for Demo
            if (post.mediaId) {
                const perf = generateMockMetrics(post.id, post.mediaId, post.platforms[0] || 'Twitter');
                logPerformance(perf);
                this.updateMediaScore(post.mediaId);
            }
        }
    }
    
    this.saveState();
    return post;
  }

  async updatePost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.updatePost(post);
    
    // Detect publish event for performance simulation
    const oldPost = this.posts.find(p => p.id === post.id);
    if (oldPost && oldPost.status !== 'Published' && post.status === 'Published') {
        // Orchestration Check
        const check = this.checkGlobalPermissions(BotType.Creator, post.platforms[0] || Platform.Twitter, ActionType.POST);
        if (!check.allowed) {
            throw new Error(`Orchestration Block: ${check.reason}`);
        }
        this.incrementGlobalUsage(post.platforms[0] || Platform.Twitter, ActionType.POST, BotType.Creator);

        if (post.mediaId) {
            const perf = generateMockMetrics(post.id, post.mediaId, post.platforms[0] || 'Twitter');
            logPerformance(perf);
            this.updateMediaScore(post.mediaId);
        }
    }

    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.saveState();
    return post;
  }

  private updateMediaScore(mediaId: string) {
      const events = getPerformanceForMedia(mediaId);
      const { score, trend } = calculateCreativeScore(events);
      
      this.media = this.media.map(m => {
          if (m.id === mediaId) {
              return { ...m, performanceScore: score, performanceTrend: trend };
          }
          return m;
      });
      this.saveState();
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
     
     // Trigger start/stop execution based on new state
     const updatedBot = this.bots.find(b => b.type === type);
     if (updatedBot) {
         if (updatedBot.enabled) this.startBotExecution(type);
         else this.stopBotExecution(type);
     }

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

  async simulateBot(type: BotType): Promise<BotActivity[]> {
      // Phase 7: Simulation should just trigger a cycle but also feed telemetry
      // For the UI 'Run Simulation' button, we want immediate feedback
      this.executeBotCycle(type);
      return this.activities[type] || [];
  }

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
      
      const url = URL.createObjectURL(f);
      const id = Date.now().toString();

      // 1. Create initial 'uploading' item
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
          // Default Governance State
          governance: { status: 'pending' }, 
          aiMetadata: { generated: false, disclosureRequired: false },
          variants: [],
          performanceScore: 50, // Start neutral
          performanceTrend: 'stable'
      };
      
      this.media = [newItem, ...this.media];
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: newItem.id,
          action: 'UPLOAD',
          actor: 'Current User',
          timestamp: new Date().toISOString()
      });

      this.processMediaInBackground(newItem, f);

      return newItem;
  }

  private async processMediaInBackground(item: MediaItem, file: File) {
      await new Promise(r => setTimeout(r, 800));
      this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'processing' } : m);
      this.saveState();

      try {
          await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

          const [metadata, thumbnailUrl] = await Promise.all([
              extractMetadata(file, item.url),
              generateThumbnail(file)
          ]);

          // Compatibility check requires metadata
          const mediaWithMeta = { ...item, metadata };
          const compatibility = evaluateCompatibility(mediaWithMeta);

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
  
  async deleteMedia(id: string): Promise<MediaItem[]> { 
      if (!this.isSimulation) return api.deleteMedia(id);
      
      // Safety Check: Usage
      const item = this.media.find(m => m.id === id);
      if (item?.usageCount && item.usageCount > 0) {
          throw new Error("Cannot delete asset currently in use by active campaigns.");
      }

      this.media = this.media.filter(m => m.id !== id);
      this.saveState();
      return this.media;
  }

  async approveMedia(id: string, user: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media; // Mock only
      this.media = this.media.map(m => m.id === id ? { 
          ...m, 
          governance: { 
              status: 'approved', 
              approvedBy: user, 
              approvedAt: new Date().toISOString() 
          } 
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'APPROVED',
          actor: user,
          timestamp: new Date().toISOString()
      });

      return this.media;
  }

  async rejectMedia(id: string, reason: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media; // Mock only
      this.media = this.media.map(m => m.id === id ? { 
          ...m, 
          governance: { 
              status: 'rejected', 
              rejectionReason: reason 
          } 
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'RESTRICTED',
          actor: 'Admin', // Assuming admin action for now
          timestamp: new Date().toISOString(),
          reason: reason
      });

      return this.media;
  }

  async resetMedia(id: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media;
      this.media = this.media.map(m => m.id === id ? {
          ...m,
          governance: { status: 'pending' }
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'RESET_TO_DRAFT',
          actor: 'Admin',
          timestamp: new Date().toISOString()
      });

      return this.media;
  }

  // --- Variant Management ---
  async createVariant(id: string, platform: string): Promise<MediaVariant> {
      if (!this.isSimulation) return {} as MediaVariant;
      
      const item = this.media.find(m => m.id === id);
      if (!item) throw new Error("Media not found");

      const variant = await generateVariant(item, platform);
      
      // Store variant
      this.media = this.media.map(m => {
          if (m.id === id) {
              const variants = m.variants || [];
              const filtered = variants.filter(v => v.platform !== platform);
              return { ...m, variants: [...filtered, variant] };
          }
          return m;
      });
      
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'VARIANT_GENERATED',
          actor: 'AI Optimization Engine',
          timestamp: new Date().toISOString(),
          reason: `Auto-generated for ${platform}`
      });

      return variant;
  }

  // --- AI Enhancement Management ---
  async createEnhancedVariant(id: string, type: EnhancementType): Promise<MediaVariant> {
      if (!this.isSimulation) return {} as MediaVariant;

      const item = this.media.find(m => m.id === id);
      if (!item) throw new Error("Media not found");

      const variant = await applyEnhancement(item, type);

      // Store variant
      this.media = this.media.map(m => {
          if (m.id === id) {
              const variants = m.variants || [];
              return { ...m, variants: [variant, ...variants] };
          }
          return m;
      });

      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'ENHANCEMENT_APPLIED',
          actor: 'AI Enhancement Engine',
          timestamp: new Date().toISOString(),
          reason: `Applied ${type.replace('_', ' ')}`
      });

      return variant;
  }

  async deleteVariant(parentId: string, variantId: string): Promise<void> {
      if (!this.isSimulation) return;
      
      this.media = this.media.map(m => {
          if (m.id === parentId && m.variants) {
              return { ...m, variants: m.variants.filter(v => v.id !== variantId) };
          }
          return m;
      });
      
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: parentId,
          action: 'VARIANT_DELETED',
          actor: 'Current User',
          timestamp: new Date().toISOString()
      });
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
