
import { BotConfig, Campaign, Post, MediaItem, BotType, User, UserSettings, DashboardStats, PlatformAnalytics, MediaVariant, EnhancementType } from '../types';

const BASE = '/api'; // Proxied by Vite to http://localhost:3000

const headers = { 'Content-Type': 'application/json' };

export const api = {
  // --- Auth ---
  login: async (email: string, pass: string): Promise<{ token: string, user: User }> => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password: pass })
    });
    return res.json();
  },

  // --- Stats & Analytics ---
  getStats: async (): Promise<DashboardStats> => (await fetch(`${BASE}/stats`)).json(),
  getAnalytics: async (): Promise<PlatformAnalytics> => (await fetch(`${BASE}/analytics`)).json(),
  getPlatformAnalytics: async (platform: any): Promise<PlatformAnalytics> => {
      // In real app, pass platform as query param
      return (await fetch(`${BASE}/analytics`)).json();
  },

  // --- Bots ---
  getBots: async (): Promise<BotConfig[]> => (await fetch(`${BASE}/bots`)).json(),
  
  toggleBot: async (id: string): Promise<BotConfig[]> => {
    return (await fetch(`${BASE}/bots/${encodeURIComponent(id)}/toggle`, { method: 'POST' })).json();
  },
  
  updateBot: async (bot: BotConfig): Promise<BotConfig[]> => {
    return (await fetch(`${BASE}/bots/${encodeURIComponent(bot.type)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bot)
    })).json();
  },

  getBotActivity: async (type: BotType): Promise<any[]> => {
      return (await fetch(`${BASE}/bots/${encodeURIComponent(type)}/activity`)).json();
  },

  simulateBot: async (type: BotType): Promise<any[]> => {
      // Trigger simulation in backend
      return []; 
  },

  // --- Campaigns ---
  getCampaigns: async (): Promise<Campaign[]> => (await fetch(`${BASE}/campaigns`)).json(),
  
  addCampaign: async (camp: any): Promise<Campaign> => (await fetch(`${BASE}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify(camp)
  })).json(),

  applyCampaignRecommendation: async (id: string, recId: string) => {
      // Mock endpoint or implement in backend
  },
  
  dismissCampaignRecommendation: async (id: string, recId: string) => {
      // Mock endpoint
  },

  // --- Posts ---
  getPosts: async (): Promise<Post[]> => (await fetch(`${BASE}/posts`)).json(),
  
  addPost: async (post: any): Promise<Post> => (await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify(post)
  })).json(),

  updatePost: async (post: Post): Promise<Post> => (await fetch(`${BASE}/posts/${post.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(post)
  })).json(),

  deletePost: async (id: string): Promise<void> => {
      await fetch(`${BASE}/posts/${id}`, { method: 'DELETE' });
  },

  // --- Media ---
  getMedia: async (): Promise<MediaItem[]> => (await fetch(`${BASE}/media`)).json(),
  
  uploadMedia: async (file: File): Promise<MediaItem> => {
      const formData = new FormData();
      formData.append('file', file);
      return (await fetch(`${BASE}/media/upload`, { method: 'POST', body: formData })).json();
  },
  
  deleteMedia: async (id: string): Promise<MediaItem[]> => {
      return (await fetch(`${BASE}/media/${id}`, { method: 'DELETE' })).json();
  },

  approveMedia: async (id: string, user: string) => { /* Mock or implement */ return [] },
  rejectMedia: async (id: string, reason: string) => { /* Mock or implement */ return [] },
  resetMedia: async (id: string) => { /* Mock */ return [] },
  
  createVariant: async (id: string, platform: string): Promise<MediaVariant> => {
      return {} as MediaVariant; // Mock return
  },
  createEnhancedVariant: async (id: string, type: EnhancementType): Promise<MediaVariant> => {
      return {} as MediaVariant; // Mock return
  },
  deleteVariant: async (parentId: string, variantId: string) => {},

  // --- Users & Settings ---
  getUsers: async (): Promise<User[]> => (await fetch(`${BASE}/users`)).json(),
  getCurrentUser: async (): Promise<User> => (await fetch(`${BASE}/users/current`)).json(),
  
  addUser: async (u: any): Promise<User[]> => { return [] },
  updateUser: async (id: string, u: any): Promise<User[]> => { return [] },

  getSettings: async (): Promise<UserSettings> => (await fetch(`${BASE}/settings`)).json(),
  saveSettings: async (s: UserSettings): Promise<UserSettings> => (await fetch(`${BASE}/settings`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(s)
  })).json(),

  togglePlatformConnection: async (platform: string): Promise<User> => {
      return (await fetch(`${BASE}/integrations/${platform}/toggle`, { method: 'POST' })).json();
  },

  // --- Policies (Mock for now) ---
  getGlobalPolicy: () => ({ emergencyStop: false, quietHours: { enabled: false, startTime: '', endTime: '', timezone: '' }, platformLimits: {} }),
  getDailyGlobalActions: () => ({}),
  updateGlobalPolicy: () => {},
  getAdaptiveConfig: () => ({ mode: 'Balanced', autoOptimize: false, lastOptimization: '' }),
  setAdaptiveConfig: () => {},
  getOptimizationSuggestions: () => [],
  applyLearningEvent: () => {},
  ignoreLearningEvent: () => {},
  lockLearningField: () => {},
  getPlatforms: () => [],
  togglePlatformEnabled: () => {},
  setPlatformOutage: () => {},
};
