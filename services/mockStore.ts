
import { BotConfig, BotType, DashboardStats, Platform, Post, PostStatus, UserSettings, PlatformAnalytics, User, UserRole, UserStatus, MediaItem, BotActivity, ActivityStatus, ActionType, MediaMetadata, SimulationReport, SimulationCycle, AssetDecision, MediaAuditEvent, MediaVariant } from '../types';
import { api } from './api';
import { logAudit } from './auditStore';
import { evaluateCompatibility } from './platformCompatibility';
import { generateVariant } from './mediaVariantService';

// --- MOCK DATA CONSTANTS ---

const DEFAULT_BOTS: BotConfig[] = [
  {
    type: BotType.Creator,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 60,
    logs: [],
    config: {
      contentTopics: ['Industry News', 'Tips & Tricks', 'Company Updates', 'Thought Leadership'],
      targetPlatforms: [Platform.Twitter, Platform.LinkedIn],
      generationMode: 'AI',
      safetyLevel: 'Moderate',
      workHoursStart: '09:00',
      workHoursEnd: '17:00',
      aiStrategy: {
        creativityLevel: 'Medium',
        brandVoice: 'Professional',
        keywordsToInclude: ['Innovation', 'Growth'],
        topicsToAvoid: ['Politics', 'Religion']
      }
    },
    stats: { currentDailyActions: 0, maxDailyActions: 10, consecutiveErrors: 0 }
  },
  {
    type: BotType.Engagement,
    enabled: true,
    status: 'Idle',
    intervalMinutes: 30,
    logs: [],
    config: {
      replyToMentions: true,
      replyToComments: true,
      maxDailyInteractions: 50,
      safetyLevel: 'Moderate',
      workHoursStart: '08:00',
      workHoursEnd: '20:00',
      minDelaySeconds: 60,
      maxDelaySeconds: 300
    },
    stats: { currentDailyActions: 0, maxDailyActions: 50, consecutiveErrors: 0 }
  },
  {
    type: BotType.Finder,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 120,
    logs: [],
    config: {
      trackKeywords: ['SaaS', 'AI', 'Automation', 'Marketing'],
      trackAccounts: [],
      autoSaveToDrafts: true,
      safetyLevel: 'Conservative',
      workHoursStart: '00:00',
      workHoursEnd: '23:59'
    },
    stats: { currentDailyActions: 0, maxDailyActions: 100, consecutiveErrors: 0 }
  },
  {
    type: BotType.Growth,
    enabled: false,
    status: 'Idle',
    intervalMinutes: 240,
    logs: [],
    config: {
      growthTags: ['#Tech', '#Startup', '#Marketing', '#Founder'],
      interactWithCompetitors: false,
      unfollowAfterDays: 7,
      safetyLevel: 'Conservative',
      workHoursStart: '10:00',
      workHoursEnd: '18:00'
    },
    stats: { currentDailyActions: 0, maxDailyActions: 25, consecutiveErrors: 0 }
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    content: 'Just launched our new feature! #Tech #Startup',
    platforms: [Platform.Twitter, Platform.LinkedIn],
    scheduledFor: new Date().toISOString(),
    status: PostStatus.Published,
    generatedByAi: false,
    author: 'User',
    mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    mediaType: 'image',
    engagement: { likes: 120, shares: 34, comments: 12 }
  },
];

const RAW_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    name: 'Product_Launch_Teaser.mp4',
    type: 'video',
    url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    size: 15400000,
    createdAt: new Date().toISOString(),
    dimensions: '1920x1080',
    metadata: { width: 1920, height: 1080, duration: 15, sizeMB: 15.4, format: 'video/mp4', aspectRatio: 1.77 },
    usageCount: 1,
    tags: ['product', 'launch'],
    collections: ['c1'],
    lastUsedAt: new Date().toISOString(),
    processingStatus: 'ready',
    governance: { status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() },
    aiMetadata: { generated: false, disclosureRequired: false },
    variants: []
  },
  {
    id: 'm2',
    name: 'Office_Tour.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    size: 2400000,
    createdAt: new Date().toISOString(),
    dimensions: '1080x1080',
    metadata: { width: 1080, height: 1080, duration: 0, sizeMB: 2.4, format: 'image/jpeg', aspectRatio: 1 },
    usageCount: 2,
    tags: ['office', 'culture'],
    collections: ['c2'],
    processingStatus: 'ready',
    governance: { status: 'approved', approvedBy: 'Admin', approvedAt: new Date().toISOString() },
    aiMetadata: { generated: false, disclosureRequired: false },
    variants: []
  },
  {
    id: 'm3',
    name: 'AI_Generated_Concept.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    size: 1800000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dimensions: '1200x800',
    metadata: { width: 1200, height: 800, duration: 0, sizeMB: 1.8, format: 'image/jpeg', aspectRatio: 1.5 },
    usageCount: 0,
    tags: ['ai', 'concept'],
    collections: [],
    processingStatus: 'ready',
    governance: { status: 'pending' },
    aiMetadata: { generated: true, tool: 'Midjourney', disclosureRequired: true },
    variants: []
  }
];

// Enrich Initial Media with Compatibility
const INITIAL_MEDIA = RAW_MEDIA.map(m => ({
    ...m,
    platformCompatibility: evaluateCompatibility(m)
}));

// --- Helper: Asset Processing Simulation ---

// Generates a thumbnail Data URL for videos (poster frame) or images (resized)
const generateThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const MAX_THUMB_SIZE = 400;

    if (file.type.startsWith('image')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, MAX_THUMB_SIZE / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Do not revoke here as the URL is used for the main item until page refresh
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => {
        resolve(''); // Fail gracefully
      };
      img.src = url;
    } else if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      
      const onSeeked = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, MAX_THUMB_SIZE / video.videoWidth);
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        video.removeEventListener('seeked', onSeeked);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      video.onloadeddata = () => {
        // Seek to 0.5s or 1s to grab a frame
        video.currentTime = Math.min(1.0, video.duration > 0 ? video.duration / 2 : 0);
      };
      
      video.onseeked = onSeeked;
      
      video.onerror = () => {
        resolve(''); // Fail gracefully
      };
    } else {
      resolve('');
    }
  });
};

const extractMetadata = (file: File, url: string): Promise<MediaMetadata> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image')) {
      const img = new Image();
      img.onload = () => resolve({ 
          width: img.width, 
          height: img.height, 
          sizeMB: file.size / 1024 / 1024, 
          format: file.type, 
          duration: 0,
          aspectRatio: img.width / img.height
      });
      img.onerror = () => resolve({ width: 0, height: 0, sizeMB: file.size / 1024 / 1024, format: file.type, duration: 0, aspectRatio: 0 });
      img.src = url;
    } else if (file.type.startsWith('video')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve({ 
          width: video.videoWidth, 
          height: video.videoHeight, 
          sizeMB: file.size / 1024 / 1024, 
          format: file.type, 
          duration: video.duration || 0,
          aspectRatio: video.videoWidth / video.videoHeight
      });
      video.onerror = () => resolve({ width: 0, height: 0, sizeMB: file.size / 1024 / 1024, format: file.type, duration: 0, aspectRatio: 0 });
      video.src = url;
    } else {
        resolve({ width: 0, height: 0, sizeMB: file.size/1024/1024, format: file.type, duration: 0, aspectRatio: 0 });
    }
  });
};

// Hybrid Store Implementation
class HybridStore {
  private posts: Post[] = [];
  private bots: BotConfig[] = [];
  private settings: UserSettings;
  private users: User[] = [];
  private media: MediaItem[] = [];
  private activities: Record<string, BotActivity[]> = {};

  constructor() {
    // Initialize Mock Data
    const savedSettings = localStorage.getItem('postmaster_settings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : { 
        demoMode: true,
        geminiApiKey: '',
        general: { language: 'English (US)', dateFormat: 'MM/DD/YYYY', startOfWeek: 'Monday' },
        workspace: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, defaultTone: 'Professional' },
        notifications: { channels: { email: true, inApp: true, slack: false }, alerts: { botActivity: true, failures: true, approvals: true } },
        security: { twoFactorEnabled: false, sessionTimeout: '30m' },
        automation: { globalSafetyLevel: 'Moderate', defaultWorkHours: { start: '09:00', end: '17:00' } }
    };
    
    // Ensure Demo Mode default
    if (savedSettings === null) this.settings.demoMode = true;

    // Load Mock Data
    const savedUsers = localStorage.getItem('postmaster_users');
    this.users = savedUsers ? JSON.parse(savedUsers) : []; 

    const savedPosts = localStorage.getItem('postmaster_posts');
    this.posts = savedPosts ? JSON.parse(savedPosts) : INITIAL_POSTS;

    const savedBots = localStorage.getItem('postmaster_bots');
    this.bots = savedBots ? JSON.parse(savedBots) : [];
    
    // Auto-seed simulation bots if empty
    if (this.bots.length === 0) {
        this.bots = DEFAULT_BOTS;
    }

    const savedMedia = localStorage.getItem('postmaster_media');
    this.media = savedMedia ? JSON.parse(savedMedia) : INITIAL_MEDIA;
  }

  private get isSimulation(): boolean {
    return this.settings.demoMode;
  }
  
  private saveState() {
      if (this.isSimulation) {
          localStorage.setItem('postmaster_posts', JSON.stringify(this.posts));
          localStorage.setItem('postmaster_bots', JSON.stringify(this.bots));
          localStorage.setItem('postmaster_settings', JSON.stringify(this.settings));
          localStorage.setItem('postmaster_users', JSON.stringify(this.users));
          localStorage.setItem('postmaster_media', JSON.stringify(this.media));
      }
  }

  // --- Core Asset Selection Logic (Shared) ---
  // This function is deterministic and used by both live bot (via worker shim) and simulation engine
  private selectAssetForBot(
    bot: BotConfig,
    virtualTime: Date,
    usageHistoryOverride?: Record<string, string> // Map of assetId -> ISO date string
  ): { selected: MediaItem | null, trace: AssetDecision[] } {
      
      const trace: AssetDecision[] = [];
      const candidates = this.media; // In real app, might filter by collection ID here
      
      const eligibleAssets = candidates.filter(asset => {
          let decision: AssetDecision = { 
              assetId: asset.id, 
              assetName: asset.name, 
              status: 'rejected', 
              score: 0 
          };

          // 1. Governance Check (New)
          if (asset.governance.status !== 'approved') {
              decision.reason = `Governance Status is '${asset.governance.status}' (Must be approved)`;
              trace.push(decision);
              return false;
          }

          // 2. Cooldown Check (Virtual Time Aware)
          // Use override history if provided (for simulation), else real asset state
          const lastUsedIso = usageHistoryOverride?.[asset.id] || asset.lastUsedAt;
          if (lastUsedIso) {
              const lastUsedDate = new Date(lastUsedIso);
              // Default 3 day cooldown if not configured
              const cooldownDays = 3; 
              const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
              const diff = virtualTime.getTime() - lastUsedDate.getTime();
              
              if (diff < cooldownMs) {
                  const hoursRemaining = Math.ceil((cooldownMs - diff) / (1000 * 60 * 60));
                  decision.reason = `Cooldown Active (${hoursRemaining}h remaining)`;
                  trace.push(decision);
                  return false;
              }
          }

          decision.status = 'accepted';
          decision.score = 100; // Base score, could add weighted logic here
          trace.push(decision);
          return true;
      });

      // Simple selection strategy: Round Robin / Random for now
      // In a real implementation, we'd sort by performance score or 'least recently used'
      const selected = eligibleAssets.length > 0 
          ? eligibleAssets[Math.floor(Math.random() * eligibleAssets.length)] 
          : null;

      return { selected, trace };
  }

  // --- Forecast Engine ---
  async runBotForecast(botType: BotType, mode: 'single' | 'day' | 'stress'): Promise<SimulationReport> {
      // ... (existing implementation)
      return { timeline: [], risks: [], summary: { totalCycles: 0, successful: 0, skipped: 0 } };
  }

  async getCurrentUser(): Promise<User | undefined> {
    if (!this.isSimulation) {
        const users = await api.getUsers();
        return users[0];
    }
    return { id: '1', name: 'Admin', email: 'admin@test.com', role: UserRole.Admin, status: UserStatus.Active, lastActive: 'Now', connectedAccounts: {} };
  }

  // --- Post Methods ---
  async getPosts(): Promise<Post[]> {
    if (!this.isSimulation) return api.getPosts();
    return this.posts;
  }

  async addPost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.addPost(post);
    this.posts = [post, ...this.posts];
    
    // If post uses media, update its lastUsedAt in real store
    if (post.mediaUrl && post.status === 'Published') {
        const media = this.media.find(m => m.url === post.mediaUrl);
        if (media) {
            media.lastUsedAt = new Date().toISOString();
            media.usageCount = (media.usageCount || 0) + 1;
        }
    }
    
    this.saveState();
    return post;
  }

  async updatePost(post: Post): Promise<Post> {
    if (!this.isSimulation) return api.updatePost(post);
    this.posts = this.posts.map(p => p.id === post.id ? post : p);
    this.saveState();
    return post;
  }

  async deletePost(id: string): Promise<void> {
    if (!this.isSimulation) return api.deletePost(id);
    this.posts = this.posts.filter(p => p.id !== id);
    this.saveState();
  }

  // --- Bot Methods ---
  async getBots(): Promise<BotConfig[]> {
    if (!this.isSimulation) {
      try {
        const remoteBots = await api.getBots();
        if (Array.isArray(remoteBots) && remoteBots.length > 0) {
          return remoteBots;
        }
      } catch (error) {
        console.warn("[HybridStore] API error, falling back to local defaults.", error);
      }
      return DEFAULT_BOTS;
    }

    if (this.bots.length === 0) {
        this.bots = DEFAULT_BOTS;
        this.saveState();
    }
    return this.bots;
  }
  
  async toggleBot(type: BotType): Promise<BotConfig[]> {
     if (!this.isSimulation) {
        try {
            return await api.toggleBot(type);
        } catch (e) {
            console.error("Failed to toggle bot in prod:", e);
            return DEFAULT_BOTS;
        }
     }
     
     this.bots = this.bots.map(b => b.type === type ? { ...b, enabled: !b.enabled, status: !b.enabled ? 'Running' : 'Idle' } : b);
     this.saveState();
     return this.bots;
  }

  async updateBot(bot: BotConfig): Promise<BotConfig[]> {
      if (!this.isSimulation) {
        try {
            return await api.updateBot(bot);
        } catch (e) {
            console.error("Failed to update bot in prod:", e);
            return DEFAULT_BOTS;
        }
      }
      
      this.bots = this.bots.map(b => b.type === bot.type ? bot : b);
      this.saveState();
      return this.bots;
  }

  async simulateBot(type: BotType): Promise<BotActivity[]> {
      if (!this.isSimulation) return await api.simulateBot(type);
      return [];
  }

  async getBotActivity(type: BotType): Promise<BotActivity[]> {
    if (!this.isSimulation) {
        try {
            return await api.getBotActivity(type);
        } catch (e) {
            console.warn("Failed to fetch activity:", e);
            return [];
        }
    }
    
    if (!this.activities[type]) {
        this.activities[type] = [];
    }
    return this.activities[type];
  }

  // --- Stats & Settings ---
  async getStats(): Promise<DashboardStats> { 
      try {
          return !this.isSimulation ? await api.getStats() : { 
              totalPosts: this.posts.length, 
              totalReach: 12500, 
              engagementRate: 4.2, 
              activeBots: this.bots.filter(b => b.enabled).length 
          };
      } catch (e) {
          return { totalPosts: 0, totalReach: 0, engagementRate: 0, activeBots: 0 };
      }
  }

  async getSettings(): Promise<UserSettings> { 
      try {
        return !this.isSimulation ? await api.getSettings() : this.settings; 
      } catch (e) {
        return this.settings;
      }
  }
  
  async saveSettings(s: UserSettings): Promise<UserSettings> { 
      if (!this.isSimulation) return api.saveSettings(s);
      this.settings = s;
      this.saveState();
      return s; 
  }
  
  async getUsers(): Promise<User[]> { 
      try {
        return !this.isSimulation ? await api.getUsers() : this.users; 
      } catch (e) {
        return this.users;
      }
  }
  
  async addUser(u: any): Promise<User[]> { 
      if (!this.isSimulation) return api.addUser(u);
      this.users.push({ ...u, id: Date.now().toString() });
      this.saveState();
      return this.users;
  }
  
  async updateUser(id: string, u: any): Promise<User[]> { 
      if (!this.isSimulation) return api.updateUser(id, u);
      this.users = this.users.map(user => user.id === id ? { ...user, ...u } : user);
      this.saveState();
      return this.users;
  }
  
  async getMedia(): Promise<MediaItem[]> { 
      try {
        return !this.isSimulation ? await api.getMedia() : this.media; 
      } catch (e) {
        return this.media;
      }
  }
  
  async uploadMedia(f: File): Promise<MediaItem> { 
      if (!this.isSimulation) return api.uploadMedia(f);
      
      const url = URL.createObjectURL(f);
      const id = Date.now().toString();

      // 1. Create initial 'uploading' item
      const newItem: MediaItem = {
          id,
          name: f.name,
          type: f.type.startsWith('video') ? 'video' : 'image',
          url: url,
          thumbnailUrl: f.type.startsWith('image') ? url : undefined,
          size: f.size,
          createdAt: new Date().toISOString(),
          dimensions: 'Pending...',
          processingStatus: 'uploading',
          usageCount: 0,
          tags: [f.type.startsWith('video') ? 'video' : 'image'],
          // Default Governance State
          governance: { status: 'pending' }, 
          aiMetadata: { generated: false, disclosureRequired: false },
          variants: []
      };
      
      this.media = [newItem, ...this.media];
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: newItem.id,
          action: 'UPLOAD',
          actor: 'Current User',
          timestamp: new Date().toISOString()
      });

      this.processMediaInBackground(newItem, f);

      return newItem;
  }

  private async processMediaInBackground(item: MediaItem, file: File) {
      await new Promise(r => setTimeout(r, 800));
      this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'processing' } : m);
      this.saveState();

      try {
          await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

          const [metadata, thumbnailUrl] = await Promise.all([
              extractMetadata(file, item.url),
              generateThumbnail(file)
          ]);

          // Compatibility check requires metadata
          const mediaWithMeta = { ...item, metadata };
          const compatibility = evaluateCompatibility(mediaWithMeta);

          this.media = this.media.map(m => m.id === item.id ? { 
              ...m, 
              processingStatus: 'ready',
              dimensions: `${metadata.width}x${metadata.height}`,
              metadata,
              thumbnailUrl: thumbnailUrl || (m.type === 'image' ? m.url : undefined),
              platformCompatibility: compatibility
          } : m);
          this.saveState();

      } catch (error) {
          console.error("Media processing failed", error);
          this.media = this.media.map(m => m.id === item.id ? { ...m, processingStatus: 'failed' } : m);
          this.saveState();
      }
  }
  
  async deleteMedia(id: string): Promise<MediaItem[]> { 
      if (!this.isSimulation) return api.deleteMedia(id);
      
      // Safety Check: Usage
      const item = this.media.find(m => m.id === id);
      if (item?.usageCount && item.usageCount > 0) {
          throw new Error("Cannot delete asset currently in use by active campaigns.");
      }

      this.media = this.media.filter(m => m.id !== id);
      this.saveState();
      return this.media;
  }

  async approveMedia(id: string, user: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media; // Mock only
      this.media = this.media.map(m => m.id === id ? { 
          ...m, 
          governance: { 
              status: 'approved', 
              approvedBy: user, 
              approvedAt: new Date().toISOString() 
          } 
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'APPROVED',
          actor: user,
          timestamp: new Date().toISOString()
      });

      return this.media;
  }

  async rejectMedia(id: string, reason: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media; // Mock only
      this.media = this.media.map(m => m.id === id ? { 
          ...m, 
          governance: { 
              status: 'rejected', 
              rejectionReason: reason 
          } 
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'RESTRICTED',
          actor: 'Admin', // Assuming admin action for now
          timestamp: new Date().toISOString(),
          reason: reason
      });

      return this.media;
  }

  async resetMedia(id: string): Promise<MediaItem[]> {
      if (!this.isSimulation) return this.media;
      this.media = this.media.map(m => m.id === id ? {
          ...m,
          governance: { status: 'pending' }
      } : m);
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'RESET_TO_DRAFT',
          actor: 'Admin',
          timestamp: new Date().toISOString()
      });

      return this.media;
  }

  // --- Variant Management ---
  async createVariant(id: string, platform: string): Promise<MediaVariant> {
      if (!this.isSimulation) return {} as MediaVariant;
      
      const item = this.media.find(m => m.id === id);
      if (!item) throw new Error("Media not found");

      const variant = await generateVariant(item, platform);
      
      // Store variant
      this.media = this.media.map(m => {
          if (m.id === id) {
              const variants = m.variants || [];
              // Remove old variant for same platform if exists
              const filtered = variants.filter(v => v.platform !== platform);
              return { ...m, variants: [...filtered, variant] };
          }
          return m;
      });
      
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: id,
          action: 'VARIANT_GENERATED',
          actor: 'AI Optimization Engine',
          timestamp: new Date().toISOString(),
          reason: `Auto-generated for ${platform}`
      });

      return variant;
  }

  async deleteVariant(parentId: string, variantId: string): Promise<void> {
      if (!this.isSimulation) return;
      
      this.media = this.media.map(m => {
          if (m.id === parentId && m.variants) {
              return { ...m, variants: m.variants.filter(v => v.id !== variantId) };
          }
          return m;
      });
      
      this.saveState();

      logAudit({
          id: Date.now().toString() + Math.random(),
          mediaId: parentId,
          action: 'VARIANT_DELETED',
          actor: 'Current User',
          timestamp: new Date().toISOString()
      });
  }
  
  async createOptimizedCopy(id: string, v: string): Promise<MediaItem> { return {} as MediaItem; }
  
  async getPlatformAnalytics(p: any): Promise<PlatformAnalytics> { 
      return {
          platform: p,
          summary: { followers: 1200, followersGrowth: 5.4, impressions: 45000, impressionsGrowth: 12.5, engagementRate: 3.8, engagementGrowth: 1.2 },
          history: Array.from({length: 7}, (_, i) => ({
              date: new Date(Date.now() - (6-i)*86400000).toLocaleDateString(),
              followers: 1200 + i*10,
              impressions: 4000 + Math.random()*1000,
              engagement: 200 + Math.random()*50
          }))
      }; 
  }
  
  async togglePlatformConnection(p: Platform): Promise<User> { 
      return {} as User; 
  }
}

export const store = new HybridStore();
