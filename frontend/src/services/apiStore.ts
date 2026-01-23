import axios from 'axios';
import { BotConfig, Post, MediaItem, DashboardStats, User, UserSettings, BotType, BotActivity } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

class ApiStore {
  private client = axios.create({ baseURL: API_URL });

  // --- Media ---
  async getMedia(): Promise<MediaItem[]> {
    const { data } = await this.client.get('/media');
    // Map backend enums/types to frontend if necessary
    return data.map((m: any) => ({
      ...m,
      type: m.type.toLowerCase(), // Backend Enum 'Image' -> 'image'
      governance: { status: m.governanceStatus.toLowerCase() }
    }));
  }

  async uploadMedia(file: File): Promise<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.client.post('/media/upload', formData);
    return data;
  }

  async deleteMedia(id: string): Promise<MediaItem[]> {
    // Implement delete endpoint in backend if needed, for now mock success
    return this.getMedia();
  }

  // --- Bots ---
  async getBots(): Promise<BotConfig[]> {
    const { data } = await this.client.get('/bots');
    // Backend returns flat JSONB, we map it to frontend structure
    return data.map((b: any) => ({
      ...b,
      config: b.configJson,
      learning: b.learningConfigJson,
      logs: b.activities // Mapped in controller
    }));
  }

  async updateBot(bot: BotConfig): Promise<BotConfig[]> {
    await this.client.patch(`/bots/${bot.id || bot.type}/config`, {
      config: bot.config,
      learning: bot.learning
    });
    return this.getBots();
  }

  async toggleBot(type: BotType): Promise<BotConfig[]> {
    await this.client.patch(`/bots/${type}/toggle`);
    return this.getBots();
  }

  async simulateBot(type: BotType): Promise<BotActivity[]> {
    await this.client.post('/simulation/run', { botType: type });
    return this.getBotActivity(type);
  }

  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    // In a real app, you'd fetch this from a specific endpoint
    // For now, we rely on the `getBots` include
    const bots = await this.getBots();
    const bot = bots.find(b => b.type === type);
    return bot ? (bot.logs as any) : [];
  }

  // --- Posts ---
  async getPosts(): Promise<Post[]> {
    const { data } = await this.client.get('/posts');
    return data;
  }

  async addPost(post: Post): Promise<Post> {
    const { data } = await this.client.post('/posts', post);
    return data;
  }

  async updatePost(post: Post): Promise<Post> {
    // Backend should support PUT /posts/:id
    return post; 
  }

  async deletePost(id: string): Promise<void> {
    // Backend should support DELETE /posts/:id
  }

  // --- User & Settings ---
  async getCurrentUser(): Promise<User | undefined> {
    // Mock user for now until Auth is fully UI-integrated
    return {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@contentcaster.io',
      role: 'Admin' as any,
      status: 'Active' as any,
      lastActive: 'Now',
      connectedAccounts: {}
    };
  }

  async getSettings(): Promise<UserSettings> {
    // Return default settings or fetch from BE
    return {
      demoMode: false,
      geminiApiKey: '',
      general: { language: 'en', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
      workspace: { timezone: 'UTC', defaultTone: 'Professional' },
      notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
      security: { twoFactorEnabled: false, sessionTimeout: '30m' },
      automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
    };
  }

  async saveSettings(s: UserSettings): Promise<UserSettings> {
    return s;
  }

  // --- Helpers for types ---
  async getUsers() { return []; }
  async addUser(u: any) { return []; }
  async updateUser(id: string, u: any) { return []; }
  async approveMedia(id: string) { return []; }
  async rejectMedia(id: string) { return []; }
  async getStats(): Promise<DashboardStats> {
    return { totalPosts: 0, totalReach: 0, engagementRate: 0, activeBots: 0 };
  }
  async getPlatformAnalytics(p: any) {
    return { platform: p, summary: { followers: 0, followersGrowth: 0, impressions: 0, impressionsGrowth: 0, engagementRate: 0, engagementGrowth: 0 }, history: [] };
  }
  async togglePlatformConnection(p: any) { return {} as any; }
}

export const store = new ApiStore();