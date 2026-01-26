
import { BotConfig, Campaign, Post, MediaItem, BotType, User, UserSettings, DashboardStats, PlatformAnalytics, MediaVariant, EnhancementType, PlatformConfig } from '../types';

const BASE = '/api'; // Proxied to localhost:4000

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

  // --- AI Gen ---
  generateImage: async (prompt: string, aspectRatio: string, size: string): Promise<string> => {
    // Mock simulation if backend fails or for preview
    await new Promise(r => setTimeout(r, 2000));
    return `https://source.unsplash.com/random/1080x1080/?${encodeURIComponent(prompt)}`;
  },

  editImage: async (image: string, prompt: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 2000));
    return image; // Mock return same image
  },

  generateVideo: async (image: string | undefined, prompt: string, aspectRatio: string): Promise<string> => {
    await new Promise(r => setTimeout(r, 3000));
    // Return a sample video URL
    return 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
  },

  generateAsset: async (type: 'image' | 'video', prompt: string, style: string): Promise<{ url: string, mimeType: string }> => {
      await new Promise(r => setTimeout(r, 2500));
      if (type === 'image') {
          return { 
              url: `https://source.unsplash.com/random/1080x1080/?${encodeURIComponent(prompt)},${style}`,
              mimeType: 'image/jpeg'
          };
      } else {
          return {
              url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
              mimeType: 'video/mp4'
          };
      }
  },

  chat: async (message: string, history: any[]): Promise<string> => {
      try {
        const res = await fetch(`${BASE}/ai/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message, history })
        });
        const data = await res.json();
        return data.text;
      } catch (e) {
          return "I am running in offline mode. Please connect the backend for real AI responses.";
      }
  },

  // --- Platforms & Debug (Verification) ---
  getPlatforms: async (): Promise<PlatformConfig[]> => (await fetch(`${BASE}/platforms`)).json(),
  getDebugState: async (): Promise<any> => (await fetch(`${BASE}/debug/state`)).json(),
  
  togglePlatformConnection: async (platform: string): Promise<User> => {
      return (await fetch(`${BASE}/integrations/${platform}/toggle`, { method: 'POST' })).json();
  },

  // --- Stats ---
  getStats: async (): Promise<DashboardStats> => (await fetch(`${BASE}/stats`)).json(),
  getAnalytics: async (): Promise<PlatformAnalytics> => (await fetch(`${BASE}/analytics`)).json(),

  // --- Bots ---
  getBots: async (): Promise<BotConfig[]> => (await fetch(`${BASE}/bots`)).json(),
  toggleBot: async (id: string): Promise<BotConfig[]> => (await fetch(`${BASE}/bots/${encodeURIComponent(id)}/toggle`, { method: 'POST' })).json(),
  updateBot: async (bot: BotConfig): Promise<BotConfig[]> => {
    return (await fetch(`${BASE}/bots/${encodeURIComponent(bot.type)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(bot)
    })).json();
  },
  getBotActivity: async (type: BotType): Promise<any[]> => (await fetch(`${BASE}/bots/${encodeURIComponent(type)}/activity`)).json(),
  simulateBot: async (type: BotType): Promise<any[]> => [], 

  // --- Campaigns ---
  getCampaigns: async (): Promise<Campaign[]> => (await fetch(`${BASE}/campaigns`)).json(),
  addCampaign: async (camp: any): Promise<Campaign> => (await fetch(`${BASE}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify(camp)
  })).json(),
  applyCampaignRecommendation: async () => {},
  dismissCampaignRecommendation: async () => {},

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
  deletePost: async (id: string): Promise<void> => { await fetch(`${BASE}/posts/${id}`, { method: 'DELETE' }); },

  // --- Media ---
  getMedia: async (): Promise<MediaItem[]> => (await fetch(`${BASE}/media`)).json(),
  uploadMedia: async (file: File): Promise<MediaItem> => {
      const formData = new FormData();
      formData.append('file', file);
      return (await fetch(`${BASE}/media/upload`, { method: 'POST', body: formData })).json();
  },
  deleteMedia: async (id: string): Promise<MediaItem[]> => (await fetch(`${BASE}/media/${id}`, { method: 'DELETE' })).json(),
  approveMedia: async () => [],
  rejectMedia: async () => [],
  resetMedia: async () => [],
  createVariant: async () => ({} as MediaVariant),
  createEnhancedVariant: async () => ({} as MediaVariant),
  deleteVariant: async () => {},

  // --- Users ---
  getUsers: async (): Promise<User[]> => (await fetch(`${BASE}/users`)).json(),
  getCurrentUser: async (): Promise<User> => (await fetch(`${BASE}/users/current`)).json(),
  addUser: async () => [],
  updateUser: async () => [],
  getSettings: async (): Promise<UserSettings> => (await fetch(`${BASE}/settings`)).json(),
  saveSettings: async (s: UserSettings): Promise<UserSettings> => (await fetch(`${BASE}/settings`, { method: 'PUT', headers, body: JSON.stringify(s) })).json(),

  // --- Mocks ---
  getGlobalPolicy: () => ({ emergencyStop: false, quietHours: { enabled: false, startTime: '', endTime: '', timezone: '' }, platformLimits: {} }),
  getDailyGlobalActions: () => ({}),
  updateGlobalPolicy: () => {},
  getAdaptiveConfig: () => ({ mode: 'Balanced', autoOptimize: false, lastOptimization: '' }),
  setAdaptiveConfig: () => {},
  getOptimizationSuggestions: () => [],
  applyLearningEvent: () => {},
  ignoreLearningEvent: () => {},
  lockLearningField: () => {},
  togglePlatformEnabled: () => {},
  setPlatformOutage: () => {},
};
