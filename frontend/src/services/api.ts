
import { Post, BotConfig, User, UserSettings, MediaItem, DashboardStats, BotType, Platform, BotActivity } from '../types';

const API_URL = ''; // Relative path because of Vite proxy

const headers = {
  'Content-Type': 'application/json',
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('cc_auth_token');
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers: { ...headers, ...authHeaders, ...options?.headers },
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
  updateBot: (bot: BotConfig) => request<BotConfig[]>(`/bots/${encodeURIComponent(bot.type)}/config`, { method: 'PATCH', body: JSON.stringify({config: bot.config, learning: bot.learning}) }),
  simulateBot: (type: BotType) => request<any>(`/bots/${encodeURIComponent(type)}/simulate`, { method: 'POST' }),

  // Settings
  getSettings: () => request<UserSettings>('/settings'),
  saveSettings: (settings: UserSettings) => request<UserSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  // Users
  getUsers: () => request<User[]>('/users'),
  getCurrentUser: () => request<User>('/users/current'),
  addUser: (user: Partial<User>) => request<User[]>('/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id: string, updates: Partial<User>) => request<User[]>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Media
  getMedia: () => request<MediaItem[]>('/media'),
  uploadMedia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('cc_auth_token');
    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Upload failed');
    return await response.json() as MediaItem;
  },
  deleteMedia: (id: string) => request<MediaItem[]>(`/media/${id}`, { method: 'DELETE' }),
  approveMedia: (id: string, user: string) => request<MediaItem[]>(`/media/${id}/approve`, { method: 'POST' }),
  rejectMedia: (id: string, reason: string) => request<MediaItem[]>(`/media/${id}/reject`, { method: 'POST', body: JSON.stringify({reason}) }),

  // Stats
  getStats: () => request<DashboardStats>('/stats'),

  // Integrations
  togglePlatformConnection: (platform: Platform) => request<User>(`/integrations/${platform}/toggle`, { method: 'POST' }),
  
  // Auth
  login: (email: string, password: string) => fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
  }).then(res => res.json())
};
