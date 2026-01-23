
import { Post, BotConfig, User, UserSettings, MediaItem, DashboardStats, BotType, Platform, BotActivity } from '../types';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

const headers = {
  'Content-Type': 'application/json',
};

// Generic fetch wrapper with error handling
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers,
      ...options,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Posts
  getPosts: () => request<Post[]>('/posts'),
  addPost: (post: Post) => request<Post>('/posts', { method: 'POST', body: JSON.stringify(post) }),
  updatePost: (post: Post) => request<Post>(`/posts/${post.id}`, { method: 'PUT', body: JSON.stringify(post) }),
  deletePost: (id: string) => request<void>(`/posts/${id}`, { method: 'DELETE' }),

  // Bots
  getBots: () => request<BotConfig[]>('/bots'),
  getBotActivity: (type: BotType) => request<BotActivity[]>(`/bots/${encodeURIComponent(type)}/activity`),
  toggleBot: (type: BotType) => request<BotConfig[]>(`/bots/${encodeURIComponent(type)}/toggle`, { method: 'POST' }),
  updateBot: (bot: BotConfig) => request<BotConfig[]>(`/bots/${encodeURIComponent(bot.type)}`, { method: 'PUT', body: JSON.stringify(bot) }),
  simulateBot: (type: BotType) => request<BotActivity[]>(`/bots/${encodeURIComponent(type)}/simulate`, { method: 'POST' }),

  // Settings
  getSettings: () => request<UserSettings>('/settings'),
  saveSettings: (settings: UserSettings) => request<UserSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Users
  getUsers: () => request<User[]>('/users'),
  addUser: (user: Partial<User>) => request<User[]>('/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id: string, updates: Partial<User>) => request<User[]>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Media
  getMedia: () => request<MediaItem[]>('/media'),
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    return await response.json() as MediaItem;
  },
  deleteMedia: (id: string) => request<MediaItem[]>(`/media/${id}`, { method: 'DELETE' }),

  // Stats (Aggregated on Backend for perf)
  getStats: () => request<DashboardStats>('/stats'),
};
