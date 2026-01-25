
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

export interface Post {
  id: string;
  content: string;
  platform: string;
  date: string;
  status: 'Scheduled' | 'Published' | 'Draft' | 'Processing';
}

export interface Media {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
}
