export enum Platform {
  Twitter = 'Twitter',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  LinkedIn = 'LinkedIn',
  YouTube = 'YouTube',
  Discord = 'Discord',
}

export enum BotType {
  Creator = 'Creator Bot',
  Engagement = 'Engagement Bot',
  Finder = 'Finder Bot',
  Growth = 'Growth Bot',
}

export enum PostStatus {
  Draft = 'Draft',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed',
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledFor: string; // ISO date string
  status: PostStatus;
  mediaUrl?: string;
  generatedByAi: boolean;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface BotConfig {
  type: BotType;
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: string;
  status: 'Idle' | 'Running' | 'Cooldown';
  logs: string[];
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
  // Platforms moved to User object for specific integrations
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
