
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

export enum PostStatus {
  Draft = 'Draft',
  NeedsReview = 'Needs Review',
  Approved = 'Approved',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed',
  Archived = 'Archived',
}

export interface PostVariant {
  id: string;
  name: string; // e.g., "Variant A", "Viral Copy", "Short Form"
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Post {
  id: string;
  title?: string; // Added for YouTube/Long-form
  description?: string; // Explicit description field for YouTube/Long-form
  thumbnailUrl?: string; // Added for YouTube thumbnail
  isCarousel?: boolean; // Added for Instagram Carousel
  content: string; // Always represents the content of the activeVariant
  platforms: Platform[];
  scheduledFor: string; // ISO date string
  status: PostStatus;
  mediaUrl?: string;
  mediaType?: 'image' | 'video'; // Explicit type
  generatedByAi: boolean;
  author?: 'User' | BotType; // Track authorship
  
  // A/B Testing Variants
  variants?: PostVariant[];
  activeVariantId?: string; // ID of the currently selected/published variant

  // New: Track Intent & Deep Sync Data
  creationContext?: {
    source: 'Manual' | 'AI_Assistant' | BotType;
    topic?: string;
    originalPrompt?: string;
    strategyUsed?: string;
  };

  // Deep Sync Settings Parity
  timezone?: string; // Persist scheduling timezone
  autoOps?: {
    autoEngage?: boolean; // Bot auto-reply enabled for this post
  };
  safetySettings?: {
    bypassSafety?: boolean; // If user overrode safety checks
    lastChecked?: string;
  };

  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface AIStrategyConfig {
  creativityLevel: 'Low' | 'Medium' | 'High'; // Maps to Temperature 0.2, 0.7, 1.0
  brandVoice: string; // e.g., 'Professional', 'Witty', 'Empathetic'
  keywordsToInclude: string[];
  topicsToAvoid: string[];
}

export interface CalendarConfig {
  enabled: boolean;
  maxPostsPerDay: number;
  blackoutDates: string[]; // YYYY-MM-DD strings
}

export interface BotSpecificConfig {
  // Creator Bot
  contentTopics?: string[];
  targetPlatforms?: Platform[];
  generationMode?: 'AI' | 'Drafts';
  workHoursStart?: string;
  workHoursEnd?: string;

  // Engagement Bot
  replyToMentions?: boolean;
  replyToComments?: boolean;
  watchHashtags?: string[];
  enableAutoLike?: boolean;
  maxDailyInteractions?: number;
  mutedKeywords?: string[];

  // Finder Bot
  trackKeywords?: string[];
  trackAccounts?: string[];
  autoSaveToDrafts?: boolean;

  // Growth Bot
  growthTags?: string[];
  interactWithCompetitors?: boolean;
  unfollowAfterDays?: number;
  hourlyActionLimit?: number;

  // Shared Safety Config
  safetyLevel?: 'Conservative' | 'Moderate' | 'Aggressive';
  minDelaySeconds?: number;
  maxDelaySeconds?: number;
  stopOnConsecutiveErrors?: number;

  // New AI Strategy
  aiStrategy?: AIStrategyConfig;

  // Calendar Awareness
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
  logs: BotLogEntry[]; // Structured logs
  config: BotSpecificConfig;
  
  // Safety & Usage Stats
  stats: {
    currentDailyActions: number;
    maxDailyActions: number;
    consecutiveErrors: number;
    cooldownEndsAt?: string; // ISO String if in cooldown
    itemsCreated?: number; // Track artifacts produced (Drafts, Leads, etc.)
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
    followersGrowth: number; // percentage
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

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  size: number; // in bytes
  createdAt: string;
  dimensions?: string; // e.g. "1920x1080"
}

// Navigation & Validation Types
export interface PageProps {
  onNavigate: (page: string, params?: any) => void;
  params?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
