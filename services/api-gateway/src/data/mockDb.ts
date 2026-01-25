
import { Bot, Campaign, Post, Media } from '../types';

export const db = {
  bots: [
    { id: '1', name: 'Viral Writer', type: 'Creator', status: 'Running', dailyUsage: 45, dailyLimit: 50, enabled: true },
    { id: '2', name: 'Community Manager', type: 'Engagement', status: 'Idle', dailyUsage: 12, dailyLimit: 100, enabled: true },
    { id: '3', name: 'Lead Scout', type: 'Finder', status: 'Paused', dailyUsage: 0, dailyLimit: 50, enabled: false },
    { id: '4', name: 'Network Builder', type: 'Growth', status: 'Running', dailyUsage: 88, dailyLimit: 150, enabled: true },
  ] as Bot[],

  campaigns: [
    { id: '1', name: 'Q3 Product Launch', status: 'Active', progress: 65, bots: ['1', '2'], startDate: '2023-10-01' },
    { id: '2', name: 'Brand Awareness', status: 'Active', progress: 30, bots: ['4'], startDate: '2023-10-15' },
  ] as Campaign[],

  posts: [
    { id: '1', content: 'Launching our new feature today! 🚀', platform: 'Twitter', date: new Date().toISOString(), status: 'Published' },
    { id: '2', content: 'Behind the scenes at the office.', platform: 'Instagram', date: new Date(Date.now() + 86400000).toISOString(), status: 'Scheduled' },
  ] as Post[],

  media: [
    { id: '1', name: 'Hero_Image.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' }
  ] as Media[],

  stats: {
    totalReach: 24500,
    engagementRate: 4.2,
    activeBots: 3,
    totalPosts: 142
  }
};
