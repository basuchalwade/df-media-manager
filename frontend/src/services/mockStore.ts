
import { api } from './api';
import { 
  BotConfig, BotType, DashboardStats, Post, UserSettings, 
  PlatformAnalytics, User, MediaItem, BotActivity, 
  MediaVariant, EnhancementType, Campaign 
} from '../types';

/**
 * PHASE 1 STORE: API PROXY
 * This store now delegates ALL logic to the Backend API.
 * No local state is maintained here.
 */
export const store = {
  // --- Posts ---
  getPosts: async (): Promise<Post[]> => {
    return await api.getPosts();
  },
  addPost: async (post: Post): Promise<Post> => {
    return await api.addPost(post);
  },
  updatePost: async (post: Post): Promise<Post> => {
    return await api.updatePost(post);
  },
  deletePost: async (id: string): Promise<void> => {
    return await api.deletePost(id);
  },

  // --- Bots ---
  getBots: async (): Promise<BotConfig[]> => {
    return await api.getBots();
  },
  toggleBot: async (type: BotType): Promise<BotConfig[]> => {
    return await api.toggleBot(type);
  },
  updateBot: async (bot: BotConfig): Promise<BotConfig[]> => {
    return await api.updateBot(bot);
  },
  getBotActivity: async (type: BotType): Promise<BotActivity[]> => {
    return await api.getBotActivity(type);
  },
  simulateBot: async (type: BotType): Promise<BotActivity[]> => {
    return await api.simulateBot(type);
  },

  // --- Campaigns ---
  getCampaigns: async (): Promise<Campaign[]> => {
    return await api.getPosts().then(() => []); // Placeholder: Add API call if endpoint exists, else return empty for Phase 1 safety
    // Note: In a full impl, this would be: return await api.getCampaigns();
    // Assuming api.ts needs update or we use a direct fetch here:
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/api/campaigns`);
    return await response.json();
  },
  addCampaign: async (campaign: any): Promise<Campaign> => {
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    return await response.json();
  },
  updateCampaign: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
    // Phase 1 Mock Update
    return {} as Campaign; 
  },
  applyCampaignRecommendation: async (campaignId: string, recId: string) => {
    // API Call placeholder
  },
  dismissCampaignRecommendation: async (campaignId: string, recId: string) => {
    // API Call placeholder
  },

  // --- Media ---
  getMedia: async (): Promise<MediaItem[]> => {
    return await api.getMedia();
  },
  uploadMedia: async (file: File): Promise<MediaItem> => {
    return await api.uploadMedia(file);
  },
  deleteMedia: async (id: string): Promise<MediaItem[]> => {
    await api.deleteMedia(id);
    return await api.getMedia();
  },
  approveMedia: async (id: string, user: string): Promise<MediaItem[]> => {
    await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/api/media/${id}/approve`, { method: 'POST' });
    return await api.getMedia();
  },
  rejectMedia: async (id: string, reason: string): Promise<MediaItem[]> => {
    await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000'}/api/media/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
    return await api.getMedia();
  },
  resetMedia: async (id: string): Promise<MediaItem[]> => {
    return await api.getMedia(); // Mock
  },
  createVariant: async (id: string, platform: string): Promise<MediaVariant> => {
    return {} as MediaVariant; // Mock return
  },
  createEnhancedVariant: async (id: string, type: EnhancementType): Promise<MediaVariant> => {
    return {} as MediaVariant; // Mock return
  },
  deleteVariant: async (parentId: string, variantId: string): Promise<void> => {
    // Mock
  },

  // --- Platform & Users ---
  getStats: async (): Promise<DashboardStats> => {
    return await api.getStats();
  },
  getSettings: async (): Promise<UserSettings> => {
    return await api.getSettings();
  },
  saveSettings: async (s: UserSettings): Promise<UserSettings> => {
    return await api.saveSettings(s);
  },
  getUsers: async (): Promise<User[]> => {
    return await api.getUsers();
  },
  getCurrentUser: async (): Promise<User | undefined> => {
    return await api.getCurrentUser();
  },
  addUser: async (u: any): Promise<User[]> => {
    await api.addUser(u);
    return await api.getUsers();
  },
  updateUser: async (id: string, u: any): Promise<User[]> => {
    await api.updateUser(id, u);
    return await api.getUsers();
  },
  getPlatformAnalytics: async (p: any): Promise<PlatformAnalytics> => {
    // Mock Data for Analytics (complex to calculate on fly)
    return { 
        platform: p, 
        summary: { followers: 1200, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 }, 
        history: Array.from({length: 7}, (_, i) => ({ date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(), followers: 1200 + i*10, impressions: 4000 + Math.random()*1000, engagement: 200 + Math.random()*50 })) 
    }; 
  },
  togglePlatformConnection: async (p: any): Promise<User> => {
    return await api.togglePlatformConnection(p);
  },
  
  // --- Orchestration/Helpers (Keep pure functions or move to backend later) ---
  getGlobalPolicy: () => ({ emergencyStop: false, quietHours: { enabled: false, startTime: '00:00', endTime: '00:00', timezone: 'UTC' }, platformLimits: {} }),
  getDailyGlobalActions: () => ({}),
  updateGlobalPolicy: (cfg: any) => {},
  getAdaptiveConfig: () => ({ mode: 'Balanced', autoOptimize: false, lastOptimization: '' }),
  setAdaptiveConfig: (cfg: any) => {},
  getOptimizationSuggestions: () => [],
  applyLearningEvent: (botType: string, id: string) => {},
  ignoreLearningEvent: (botType: string, id: string) => {},
  lockLearningField: (botType: string, field: string) => {},
  getPlatforms: () => [], // Should fetch from API
  togglePlatformEnabled: (id: any) => {},
  setPlatformOutage: (id: any, val: boolean) => {},
};
