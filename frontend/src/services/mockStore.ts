import { api } from './api';

// This is an adapter to make existing components work with the new API structure
// without rewriting every single import statement in the UI.
export const store = {
  // Stats & Analytics
  getStats: api.getStats,
  getAnalytics: api.getAnalytics,
  getPlatformAnalytics: api.getPlatformAnalytics,

  // Bots
  getBots: api.getBots,
  toggleBot: api.toggleBot,
  updateBot: api.updateBot,
  getBotActivity: api.getBotActivity,
  simulateBot: api.simulateBot,

  // Campaigns
  getCampaigns: api.getCampaigns,
  addCampaign: api.addCampaign,
  applyCampaignRecommendation: api.applyCampaignRecommendation,
  dismissCampaignRecommendation: api.dismissCampaignRecommendation,

  // Posts
  getPosts: api.getPosts,
  addPost: api.addPost,
  updatePost: api.updatePost,
  deletePost: api.deletePost,

  // Media
  getMedia: api.getMedia,
  uploadMedia: api.uploadMedia,
  deleteMedia: api.deleteMedia,
  approveMedia: api.approveMedia,
  rejectMedia: api.rejectMedia,
  resetMedia: api.resetMedia,
  createVariant: api.createVariant,
  createEnhancedVariant: api.createEnhancedVariant,
  deleteVariant: api.deleteVariant,

  // Users & Settings
  getUsers: api.getUsers,
  getCurrentUser: api.getCurrentUser,
  addUser: api.addUser,
  updateUser: api.updateUser,
  getSettings: api.getSettings,
  saveSettings: api.saveSettings,
  togglePlatformConnection: api.togglePlatformConnection,

  // Policies & Adaptive Strategy (Mocked in API)
  getGlobalPolicy: api.getGlobalPolicy,
  getDailyGlobalActions: api.getDailyGlobalActions,
  updateGlobalPolicy: api.updateGlobalPolicy,
  getAdaptiveConfig: api.getAdaptiveConfig,
  setAdaptiveConfig: api.setAdaptiveConfig,
  getOptimizationSuggestions: api.getOptimizationSuggestions,
  applyLearningEvent: api.applyLearningEvent,
  ignoreLearningEvent: api.ignoreLearningEvent,
  lockLearningField: api.lockLearningField,
  getPlatforms: api.getPlatforms,
  togglePlatformEnabled: api.togglePlatformEnabled,
  setPlatformOutage: api.setPlatformOutage,
  
  // Compat Properties (used by legacy components before full migration)
  bots: [], 
  campaigns: [],
  assets: [],
  posts: [],
  isSimulation: false
};
