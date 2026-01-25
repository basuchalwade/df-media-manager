
export enum Platform {
  Twitter = 'Twitter',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Threads = 'Threads',
  LinkedIn = 'LinkedIn',
  YouTube = 'YouTube',
  GoogleBusiness = 'Google Business',
}

export enum BotType {
  Creator = 'Creator Bot',
  Engagement = 'Engagement Bot',
  Finder = 'Finder Bot',
  Growth = 'Growth Bot',
}

export enum ActivityStatus {
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export enum ActionType {
  POST = 'POST',
  LIKE = 'LIKE',
  REPLY = 'REPLY',
  FOLLOW = 'FOLLOW',
  UNFOLLOW = 'UNFOLLOW',
  ANALYZE = 'ANALYZE',
  OPTIMIZE = 'OPTIMIZE'
}

export interface BotActivity {
  id: string;
  botType: BotType;
  actionType: ActionType | string;
  platform: Platform | string;
  status: ActivityStatus;
  message: string;
  error?: string;
  metadata?: any;
  createdAt: string;
  finishedAt?: string;
}

export enum CampaignObjective {
  Reach = 'Reach',
  Engagement = 'Engagement',
  Traffic = 'Traffic',
  Conversions = 'Conversions'
}

export enum CampaignStatus {
  Draft = 'Draft',
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed'
}

export interface CampaignRecommendation {
  id: string;
  type: 'budget' | 'platform' | 'bot_config';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  actionLabel: string;
  status: 'pending' | 'applied' | 'dismissed';
}

export type PacingStatus = 'UNDER' | 'OPTIMAL' | 'OVER';

export interface BudgetPacing {
  expectedSpend: number;
  actualSpend: number;
  pacingStatus: PacingStatus;
  burnRate: number;
  daysRemaining: number;
}

export interface BotAttribution {
  botId: BotType;
  spend: number;
  impactScore: number;
  liftPercentage: number;
  primaryContribution: string;
}

export interface CampaignIntelligenceData {
  pacing: BudgetPacing;
  attribution: BotAttribution[];
  kpiMapping: Record<string, string>;
  strategySummary: string;
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  platforms: Platform[];
  botIds: BotType[];
  startDate: string;
  endDate?: string;
  budget: {
    total: number;
    daily: number;
    spent: number;
    currency: string;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    costPerResult: number;
    roas?: number;
  };
  aiRecommendations: CampaignRecommendation[];
  intelligence?: CampaignIntelligenceData;
}

// Bot Rules
export interface FinderBotRules {
  keywordSources: string[];
  languages: string[];
  safeSourcesOnly: boolean;
  minRelevanceScore?: number;
}

export interface GrowthBotRules {
  followRatePerHour: number;
  unfollowAfterDays: number;
  interestTags: string[];
  ignorePrivateAccounts: boolean;
}

export interface EngagementBotRules {
  replyTone: "formal" | "casual" | "witty" | "empathetic";
  emojiLevel: number;
  maxRepliesPerHour: number;
  skipNegativeSentiment: boolean;
}

export interface CreatorBotRules {
  personality: {
    proactiveness: number;
    tone: number;
    verbosity: number;
  };
  topicBlocks: string[];
  riskLevel: "low" | "medium" | "high";
  preferVideo?: boolean;
}

export type BotRules = FinderBotRules | GrowthBotRules | EngagementBotRules | CreatorBotRules;

export type StrategyMode = 'Conservative' | 'Balanced' | 'Aggressive';

export interface AdaptiveConfig {
  mode: StrategyMode;
  autoOptimize: boolean;
  lastOptimization: string;
}

export interface OptimizationSuggestion {
  id: string;
  botType: BotType;
  parameter: string;
  oldValue: string | number;
  newValue: string | number;
  reason: string;
  impact: 'High' | 'Medium' | 'Low';
  applied: boolean;
  timestamp: string;
}

export interface LearningEntry {
  id: string;
  platform: Platform;
  actionType: ActionType;
  context: string; // e.g. "Tone: Witty" or "Topic: AI"
  outcomeScore: number; // 0-100
  timestamp: number;
}

export type LearningStrategy = 'Conservative' | 'Balanced' | 'Aggressive';

export interface BotLearningConfig {
  enabled: boolean;
  strategy: LearningStrategy;
  maxChangePerDay: number;
  lockedFields: string[];
}

export interface OptimizationEvent {
  id: string;
  timestamp: string;
  botId: string;
  field: string;
  oldValue: string | number | boolean;
  newValue: string | number | boolean;
  reason: string;
  confidence: number;
  metricsUsed: string[];
  status: 'pending' | 'applied' | 'rejected' | 'simulated';
  appliedAt?: string;
}

export interface GlobalPolicyConfig {
  emergencyStop: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  platformLimits?: any; 
}

export interface BotActionRequest {
  botType: BotType;
  platform: Platform;
  actionType: ActionType;
  targetId?: string;
  timestamp: string;
}

export interface OrchestrationLogEntry {
  id: string;
  timestamp: string;
  botType: BotType;
  actionType: ActionType;
  platform: Platform;
  status: 'APPROVED' | 'BLOCKED' | 'DEFERRED';
  reason: string;
}

export interface BotExecutionEvent {
  id: string;
  botId: string;
  botType: BotType;
  timestamp: number;
  platform: Platform;
  action: ActionType;
  status: 'executed' | 'skipped' | 'blocked' | 'optimized';
  assetId?: string;
  assetName?: string;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AIStrategyConfig {
  creativityLevel: 'Low' | 'Medium' | 'High';
  brandVoice: string;
  keywordsToInclude: string[];
  topicsToAvoid: string[];
}

export interface CalendarConfig {
  enabled: boolean;
  maxPostsPerDay: number;
  blackoutDates: string[];
}

export interface BotSpecificConfig {
  contentTopics?: string[];
  targetPlatforms?: Platform[];
  generationMode?: 'AI' | 'Drafts';
  workHoursStart?: string;
  workHoursEnd?: string;
  replyToMentions?: boolean;
  replyToComments?: boolean;
  watchHashtags?: string[];
  enableAutoLike?: boolean;
  maxDailyInteractions?: number;
  mutedKeywords?: string[];
  trackKeywords?: string[];
  trackAccounts?: string[];
  autoSaveToDrafts?: boolean;
  growthTags?: string[];
  interactWithCompetitors?: boolean;
  unfollowAfterDays?: number;
  hourlyActionLimit?: number;
  safetyLevel?: 'Conservative' | 'Moderate' | 'Aggressive';
  minDelaySeconds?: number;
  maxDelaySeconds?: number;
  stopOnConsecutiveErrors?: number;
  aiStrategy?: AIStrategyConfig;
  calendarConfig?: CalendarConfig;
  rules?: BotRules; 
}

export type BotStatus = 'Idle' | 'Running' | 'Cooldown' | 'LimitReached' | 'Error';

export interface BotConfig {
  type: BotType;
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: string;
  status: BotStatus;
  logs: BotActivity[];
  config: BotSpecificConfig;
  stats: {
    currentDailyActions: number;
    maxDailyActions: number;
    consecutiveErrors: number;
    cooldownEndsAt?: string;
    itemsCreated?: number;
  };
  learning?: BotLearningConfig;
  optimizationHistory?: OptimizationEvent[];
}

export interface DashboardStats {
  totalPosts: number;
  totalReach: number;
  engagementRate: number;
  activeBots: number;
}

export interface UserSettings {
  demoMode: boolean;
  geminiApiKey: string;
  general: {
    language: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    startOfWeek: 'Sunday' | 'Monday';
  };
  workspace: {
    timezone: string;
    defaultTone: string;
  };
  notifications: {
    channels: {
      email: boolean;
      inApp: boolean;
      slack: boolean;
    };
    alerts: {
      botActivity: boolean;
      failures: boolean;
      approvals: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: string;
  };
  automation: {
    globalSafetyLevel: 'Conservative' | 'Moderate' | 'Aggressive';
    defaultWorkHours: { start: string; end: string };
  };
}

export interface AnalyticsDataPoint {
  date: string;
  followers: number;
  impressions: number;
  engagement: number;
}

export interface PlatformAnalytics {
  platform: Platform | 'All';
  summary: {
    followers: number;
    followersGrowth: number;
    impressions: number;
    impressionsGrowth: number;
    engagementRate: number;
    engagementGrowth: number;
    globalPolicyStatus?: {
        limitReached: boolean;
        actionsRemaining: number;
    }
  };
  history: AnalyticsDataPoint[];
}

export enum UserRole {
  Admin = 'Admin',
  Monitor = 'Monitor',
  Viewer = 'Viewer',
}

export enum UserStatus {
  Active = 'Active',
  Suspended = 'Suspended',
  Invited = 'Invited',
}

export interface UserConnection {
  connected: boolean;
  handle?: string;
  lastSync?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  avatar?: string;
  connectedAccounts: {
    [key in Platform]?: UserConnection;
  };
}

export type AuditAction =
  | 'UPLOAD'
  | 'APPROVED'
  | 'RESTRICTED'
  | 'RESET_TO_DRAFT'
  | 'AI_FLAGGED'
  | 'AI_CLEARED'
  | 'VARIANT_GENERATED'
  | 'VARIANT_DELETED'
  | 'ENHANCEMENT_APPLIED';

export interface MediaAuditEvent {
  id: string;
  mediaId: string;
  action: AuditAction | string;
  actor: string;
  timestamp: string;
  reason?: string;
}

export interface MediaGovernance {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface MediaAIMetadata {
  generated: boolean;
  tool?: string;
  disclosureRequired: boolean;
  originalPrompt?: string;
}

export interface MediaMetadata {
  width: number;
  height: number;
  duration?: number;
  sizeMB: number;
  format: string;
  aspectRatio: number;
}

export interface PlatformCompatibility {
  compatible: boolean;
  issues: string[];
}

export type EnhancementType =
  | 'auto_brightness'
  | 'auto_contrast'
  | 'smart_crop'
  | 'face_focus'
  | 'text_safe_margin'
  | 'brand_overlay';

export interface PostPerformance {
  id: string;
  postId: string;
  mediaId: string;
  variantId?: string;
  platform: string; 
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  engagementRate: number;
  collectedAt: string;
}

export interface MediaVariant {
  id: string;
  parentId: string;
  platform: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  createdAt: string;
  generatedBy: 'ai' | 'user';
  status: 'ready' | 'failed';
  enhancementType?: EnhancementType;
  enhancementScore?: number;
  performanceScore?: number;
  performanceTrend?: 'up' | 'down' | 'stable';
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: number;
  createdAt: string;
  thumbnailUrl?: string;
  tags?: string[];
  governance: MediaGovernance;
  usageCount?: number;
  lastUsedAt?: string;
  processingStatus?: 'uploading' | 'processing' | 'ready' | 'failed';
  variants?: MediaVariant[];
  platformCompatibility?: Record<string, PlatformCompatibility>;
  collections?: string[];
  metadata?: MediaMetadata;
  performanceScore?: number;
  performanceTrend?: 'up' | 'down' | 'stable';
  aiMetadata?: MediaAIMetadata;
  dimensions?: string; 
}

export enum PostStatus {
  Draft = 'Draft',
  NeedsReview = 'Needs Review',
  Approved = 'Approved',
  Scheduled = 'Scheduled',
  Processing = 'Processing',
  Published = 'Published',
  Failed = 'Failed',
  Archived = 'Archived',
}

export interface PostVariant {
  id: string;
  name: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Post {
  id: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  isCarousel?: boolean;
  content: string;
  platforms: Platform[];
  scheduledFor: string;
  status: PostStatus;
  mediaUrl?: string;
  mediaId?: string;
  author?: 'User' | BotType | string;
  generatedByAi?: boolean;
  variants?: PostVariant[];
  activeVariantId?: string;
  creationContext?: {
    source: 'Manual' | 'AI_Assistant' | BotType;
    topic?: string;
    originalPrompt?: string;
    strategyUsed?: string;
  };
  timezone?: string;
  autoOps?: {
    autoEngage?: boolean;
  };
  safetySettings?: {
    bypassSafety?: boolean;
    lastChecked?: string;
  };
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
  metrics?: { likes: number; shares: number; comments: number };
  mediaType?: 'image' | 'video';
}

export interface PlatformConfig {
  id: Platform;
  name: string;
  enabled: boolean;
  connected: boolean;
  outage: boolean;
  supports: {
    [key in ActionType]?: boolean;
  };
  rateLimits: {
    [key in ActionType]?: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PageProps {
  onNavigate: (page: string, params?: any) => void;
  params?: any;
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  type: 'POLICY' | 'CONFLICT' | 'PRIORITY' | 'PLATFORM' | 'OK';
}

export interface StrategyProfile {
  mode: StrategyMode;
  postFrequencyMultiplier: number;
  engagementIntensity: number;
  growthAggression: number;
  riskTolerance: number;
}

// --- Simulation Types ---

export interface AssetDecision {
  assetId: string;
  assetName: string;
  status: 'accepted' | 'rejected';
  reason?: string;
  score?: number;
}

export interface SimulationCycle {
  id: string;
  timestamp: string; // Virtual time
  action: string;
  asset?: MediaItem;
  decisionTrace: AssetDecision[];
  outcome: 'Posted' | 'Skipped' | 'Failed';
  message: string;
}

export interface SimulationReport {
  timeline: SimulationCycle[];
  risks: string[];
  summary: {
    totalCycles: number;
    successful: number;
    skipped: number;
  };
}
