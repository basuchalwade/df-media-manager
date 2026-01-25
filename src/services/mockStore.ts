
import { BotConfig, BotType, Post, PostStatus, MediaItem, Platform } from '../types';

// Initial Mock Data
const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    content: 'Launching our new feature today! 🚀 #SaaS',
    platforms: [Platform.Twitter, Platform.LinkedIn],
    scheduledFor: new Date().toISOString(),
    status: PostStatus.Published,
    author: 'User',
    metrics: { likes: 45, shares: 12, comments: 5 }
  }
];

const INITIAL_BOTS: BotConfig[] = [
  {
    type: BotType.Creator,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 60,
    stats: { currentDailyActions: 5, maxDailyActions: 20, consecutiveErrors: 0 },
    config: { topics: ['Tech', 'AI'], tone: 'Professional' },
    logs: []
  },
  {
    type: BotType.Engagement,
    enabled: true,
    status: 'Running',
    intervalMinutes: 15,
    stats: { currentDailyActions: 42, maxDailyActions: 100, consecutiveErrors: 0 },
    config: { targetTags: ['#Tech'], replyStrategy: 'Friendly' },
    logs: []
  }
];

class MockStore {
  private posts: Post[] = INITIAL_POSTS;
  private bots: BotConfig[] = INITIAL_BOTS;
  private media: MediaItem[] = [];
  
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const savedPosts = localStorage.getItem('cc_posts');
    if (savedPosts) this.posts = JSON.parse(savedPosts);
    
    const savedBots = localStorage.getItem('cc_bots');
    if (savedBots) this.bots = JSON.parse(savedBots);
  }

  private save() {
    localStorage.setItem('cc_posts', JSON.stringify(this.posts));
    localStorage.setItem('cc_bots', JSON.stringify(this.bots));
  }

  // --- Posts ---
  async getPosts() { return [...this.posts]; }
  
  async addPost(post: Post) {
    this.posts.unshift(post);
    this.save();
    return post;
  }

  async updatePost(updated: Post) {
    this.posts = this.posts.map(p => p.id === updated.id ? updated : p);
    this.save();
  }

  async deletePost(id: string) {
    this.posts = this.posts.filter(p => p.id !== id);
    this.save();
  }

  // --- Bots ---
  async getBots() { return [...this.bots]; }

  async toggleBot(type: BotType) {
    this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled } : b);
    this.save();
    return this.bots;
  }

  async getBotActivity(type: BotType) {
    const bot = this.bots.find(b => b.type === type);
    return bot?.logs || [];
  }

  // --- Media ---
  async getMedia() { return [...this.media]; }
  
  async uploadMedia(file: File) {
    const mockUrl = URL.createObjectURL(file);
    const item: MediaItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: mockUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
      governance: { status: 'approved' } // Auto-approve in mock
    };
    this.media.unshift(item);
    return item;
  }
}

export const store = new MockStore();
