
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
  NeedsReview = 'Needs Review',
  Scheduled = 'Scheduled',
  Published = 'Published',
  Failed = 'Failed'
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  size: number;
  createdAt: string;
  tags?: string[];
  governance: {
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
  };
}

export interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  scheduledFor: string;
  status: PostStatus;
  mediaUrl?: string;
  mediaId?: string;
  author: 'User' | BotType;
  metrics?: {
    likes: number;
    shares: number;
    comments: number;
  };
}

export interface BotConfig {
  type: BotType;
  enabled: boolean;
  status: 'Idle' | 'Running' | 'Error' | 'Cooldown';
  intervalMinutes: number;
  lastRun?: string;
  stats: {
    currentDailyActions: number;
    maxDailyActions: number;
    consecutiveErrors: number;
  };
  config: any; // Flexible JSON config
  logs: BotLog[];
}

export interface BotLog {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Success';
  message: string;
}

export interface UserSettings {
  demoMode: boolean;
  geminiApiKey: string;
  theme: 'light' | 'dark';
}
