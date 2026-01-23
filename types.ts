
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
  ANALYZE = 'ANALYZE'
}

export interface BotActivity {
  id: string;
  botType: BotType;
  actionType: ActionType;
  platform: Platform;
  status: ActivityStatus;
  message: string;
  error?: string;
  metadata?: any;
  createdAt: string;
  finishedAt?: string;
}

// ... (Rest of existing types below)
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
  mediaType?: 'image' | 'video';
  generatedByAi: boolean;
  author?: 'User' | BotType;
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
}

export type BotStatus = 'Idle' | 'Running' | 'Cooldown' | 'LimitReached' | 'Error';
export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Success';

export interface BotLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface BotConfig {
  type: BotType;
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: string;
  status: BotStatus;
  logs: BotLogEntry[];
  config: BotSpecificConfig;
  stats: {
    currentDailyActions: number;
    maxDailyActions: number;
    consecutiveErrors: number;
    cooldownEndsAt?: string;
    itemsCreated?: number;
  };
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

export type MediaStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: number;
  createdAt: string;
  status: MediaStatus;
  dimensions?: string;
}

export interface PageProps {
  onNavigate: (page: string, params?: any) => void;
  params?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
