
import { BotConfig, Campaign, Post, MediaItem, BotType, User } from '../types';

const BASE = '/api';

export const api = {
  // Auth
  login: async (email: string, pass: string): Promise<{ token: string, user: User }> => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    return res.json();
  },

  // Stats
  getStats: async () => (await fetch(`${BASE}/stats`)).json(),
  getAnalytics: async () => (await fetch(`${BASE}/analytics`)).json(),

  // Bots
  getBots: async (): Promise<BotConfig[]> => {
    const bots = await (await fetch(`${BASE}/bots`)).json();
    // Map simplified API response to full BotConfig if necessary
    return bots.map((b: any) => {
        // Handle name mapping to BotType enum if backend returns simple strings
        let typeVal = BotType.Creator;
        if (b.type.includes('Engagement')) typeVal = BotType.Engagement;
        if (b.type.includes('Growth')) typeVal = BotType.Growth;
        if (b.type.includes('Finder')) typeVal = BotType.Finder;

        return {
            ...b,
            type: typeVal,
            config: b.configJson || {},
            stats: { 
                currentDailyActions: b.dailyUsage || 0, 
                maxDailyActions: b.dailyLimit || 100,
                consecutiveErrors: 0 
            },
            logs: []
        } as BotConfig;
    });
  },
  toggleBot: async (id: string) => (await fetch(`${BASE}/bots/${id}/toggle`, { method: 'POST' })).json(),

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => (await fetch(`${BASE}/campaigns`)).json(),
  addCampaign: async (camp: any) => (await fetch(`${BASE}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(camp)
  })).json(),

  // Posts
  getPosts: async (): Promise<Post[]> => (await fetch(`${BASE}/posts`)).json(),
  addPost: async (post: any) => (await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post)
  })).json(),

  // Media
  getMedia: async (): Promise<MediaItem[]> => (await fetch(`${BASE}/media`)).json(),
  uploadMedia: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return (await fetch(`${BASE}/media/upload`, { method: 'POST', body: formData })).json();
  },
  deleteMedia: async (id: string) => (await fetch(`${BASE}/media/${id}`, { method: 'DELETE' })).json(),
};
