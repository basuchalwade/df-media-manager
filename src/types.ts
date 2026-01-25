
export type Platform = 'Twitter' | 'LinkedIn' | 'Instagram' | 'Facebook' | 'YouTube' | 'Google Business' | 'Threads';

export interface Bot {
  id: string;
  name: string;
  type: 'Creator' | 'Engagement' | 'Finder' | 'Growth';
  status: 'Running' | 'Idle' | 'Paused' | 'Error';
  dailyUsage: number;
  dailyLimit: number;
  enabled: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Completed';
  progress: number;
  bots: string[];
  startDate: string;
}

export interface Asset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  platform: Platform;
  campaignId: string;
}

export interface Post {
  id: string;
  content: string;
  platform: Platform;
  date: Date;
  status: 'Scheduled' | 'Published' | 'Draft';
}
