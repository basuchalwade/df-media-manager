
import { api } from './api';
import { BotConfig, BotType, DashboardStats, Post, UserSettings, PlatformAnalytics, User, MediaItem, BotActivity, MediaVariant, EnhancementType, Campaign } from '../types';

export const store = {
  getPosts: () => api.getPosts(),
  addPost: (post: Post) => api.addPost(post),
  updatePost: (post: Post) => api.updatePost(post),
  deletePost: (id: string) => api.deletePost(id),

  getBots: () => api.getBots(),
  toggleBot: (type: BotType) => api.toggleBot(type),
  updateBot: (bot: BotConfig) => api.updateBot(bot),
  getBotActivity: (type: BotType) => api.getBotActivity(type),
  simulateBot: (type: BotType) => api.simulateBot(type),

  getCampaigns: async (): Promise<Campaign[]> => {
    // Mock Campaign fetching from API manually since it's not fully in api.ts yet
    const token = localStorage.getItem('cc_auth_token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch('/api/campaigns', { headers });
    return res.json();
  },
  addCampaign: async (campaign: any) => {
    const token = localStorage.getItem('cc_auth_token');
    const headers = token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' };
    const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify(campaign)
    });
    return res.json();
  },
  
  // Phase 1 Mock Logic for frontend-only state
  updateCampaign: async (id: string, updates: Partial<Campaign>) => ({ id, ...updates } as Campaign),
  applyCampaignRecommendation: async (id: string, recId: string) => {},
  dismissCampaignRecommendation: async (id: string, recId: string) => {},

  getMedia: () => api.getMedia(),
  uploadMedia: (file: File) => api.uploadMedia(file),
  deleteMedia: (id: string) => api.deleteMedia(id),
  approveMedia: (id: string, user: string) => api.approveMedia(id, user),
  rejectMedia: (id: string, reason: string) => api.rejectMedia(id, reason),
  resetMedia: async (id: string) => api.getMedia(), // Mock

  createVariant: async (id: string, platform: string) => ({} as MediaVariant),
  createEnhancedVariant: async (id: string, type: EnhancementType) => ({} as MediaVariant),
  deleteVariant: async (parentId: string, variantId: string) => {},

  getStats: () => api.getStats(),
  getSettings: () => api.getSettings(),
  saveSettings: (s: UserSettings) => api.saveSettings(s),
  getUsers: () => api.getUsers(),
  getCurrentUser: () => api.getCurrentUser(),
  addUser: (u: any) => api.addUser(u),
  updateUser: (id: string, u: any) => api.updateUser(id, u),
  
  getPlatformAnalytics: async (p: any): Promise<PlatformAnalytics> => {
    return { 
        platform: p, 
        summary: { followers: 1200, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 }, 
        history: Array.from({length: 7}, (_, i) => ({ date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(), followers: 1200 + i*10, impressions: 4000 + Math.random()*1000, engagement: 200 + Math.random()*50 })) 
    }; 
  },
  togglePlatformConnection: (p: any) => api.togglePlatformConnection(p),

  // Helpers
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
