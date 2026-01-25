
export enum Platform {
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
  Instagram = 'Instagram',
  Facebook = 'Facebook',
  YouTube = 'YouTube',
  GoogleBusiness = 'Google Business',
  Threads = 'Threads'
}

export enum BotType {
  Creator = 'Creator Bot',
  Engagement = 'Engagement Bot',
  Finder = 'Finder Bot',
  Growth = 'Growth Bot'
}

export enum PostStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed',
  NeedsReview = 'Needs Review',
  Approved = 'Approved',
  Archived = 'Archived',
  Processing = 'Processing'
}

export type EnhancementType =
  | 'auto_brightness'
  | 'auto_contrast'
  | 'smart_crop'
  | 'face_focus'
  | 'text_safe_margin'
  | 'brand_overlay';

export interface PlatformCompatibility {
  compatible: boolean;
  issues: string[];
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
}

export interface MediaMetadata {
  width: number;
  height: number;
  duration?: number;
  sizeMB: number;
  format: string;
  aspectRatio: number;
}

export interface MediaAIMetadata {
  generated: boolean;
  tool?: string;
  disclosureRequired: boolean;
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
  governance: { 
    status: string; // 'pending' | 'approved' | 'rejected'
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
  };
  usageCount?: number;
  
  // Extended properties
  processingStatus?: 'uploading' | 'processing' | 'ready' | 'failed';
  variants?: MediaVariant[];
  platformCompatibility?: Record<string, PlatformCompatibility>;
  collections?: string[];
  metadata?: MediaMetadata;
  performanceScore?: number;
  performanceTrend?: 'up' | 'down' | 'stable';
  aiMetadata?: MediaAIMetadata;
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledFor: string;
  status: PostStatus;
  mediaUrl?: string;
  mediaId?: string;
  author?: string;
  generatedByAi?: boolean;
  metrics?: { likes: number; shares: number; comments: number };
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Success';
  message: string;
}

export interface BotConfig {
  id?: string;
  type: BotType;
  enabled: boolean;
  status: 'Idle' | 'Running' | 'Error' | 'Cooldown' | 'LimitReached';
  intervalMinutes: number;
  config: any;
  stats: { currentDailyActions: number; maxDailyActions: number; consecutiveErrors: number };
  logs: BotLog[];
  lastRun?: string;
  learning?: any;
}

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  platforms: Platform[];
  botIds: BotType[];
  startDate: string;
  budget: { total: number; daily: number; spent: number; currency: string };
  metrics: any;
  aiRecommendations: any[];
}

export enum CampaignObjective { Reach = 'Reach', Engagement = 'Engagement', Traffic = 'Traffic', Conversions = 'Conversions' }
export enum CampaignStatus { Active = 'Active', Draft = 'Draft', Paused = 'Paused', Completed = 'Completed' }

export interface DashboardStats {
  totalPosts: number;
  totalReach: number;
  engagementRate: number;
  activeBots: number;
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
