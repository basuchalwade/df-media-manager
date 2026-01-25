
import { Bot, Campaign, Asset, Post } from '../types';

class MockStore {
  bots: Bot[] = [
    { id: '1', name: 'Viral Writer', type: 'Creator', status: 'Running', dailyUsage: 45, dailyLimit: 50, enabled: true },
    { id: '2', name: 'Community Manager', type: 'Engagement', status: 'Idle', dailyUsage: 12, dailyLimit: 100, enabled: true },
    { id: '3', name: 'Lead Scout', type: 'Finder', status: 'Paused', dailyUsage: 0, dailyLimit: 50, enabled: false },
    { id: '4', name: 'Network Builder', type: 'Growth', status: 'Running', dailyUsage: 88, dailyLimit: 150, enabled: true },
  ];

  campaigns: Campaign[] = [
    { id: '1', name: 'Q3 Product Launch', status: 'Active', progress: 65, bots: ['1', '2'], startDate: '2023-10-01' },
    { id: '2', name: 'Brand Awareness', status: 'Active', progress: 30, bots: ['4'], startDate: '2023-10-15' },
    { id: '3', name: 'Holiday Special', status: 'Draft', progress: 0, bots: ['1', '2', '4'], startDate: '2023-12-01' },
  ];

  assets: Asset[] = [
    { id: '1', name: 'Hero_Image_v1.jpg', type: 'image', platform: 'Instagram', campaignId: '1', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80' },
    { id: '2', name: 'Demo_Video.mp4', type: 'video', platform: 'YouTube', campaignId: '1', url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&q=80' },
    { id: '3', name: 'Team_Photo.jpg', type: 'image', platform: 'LinkedIn', campaignId: '2', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80' },
  ];

  posts: Post[] = [
    { id: '1', content: 'Launching our new feature today! 🚀', platform: 'Twitter', date: new Date(), status: 'Published' },
    { id: '2', content: 'Behind the scenes at the office.', platform: 'Instagram', date: new Date(Date.now() + 86400000), status: 'Scheduled' },
  ];

  toggleBot(id: string) {
    this.bots = this.bots.map(b => b.id === id ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Paused' } : b);
    return [...this.bots];
  }

  addPost(post: Post) {
    this.posts.push(post);
  }
}

export const store = new MockStore();
