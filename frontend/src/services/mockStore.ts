
import { api } from './api';

// This is an adapter to make existing components work with the new API structure
// without rewriting every single import statement in the UI.
export const store = {
  getStats: api.getStats,
  getBots: api.getBots,
  toggleBot: api.toggleBot,
  getCampaigns: api.getCampaigns,
  addCampaign: api.addCampaign,
  getPosts: api.getPosts,
  addPost: api.addPost,
  getMedia: api.getMedia,
  uploadMedia: api.uploadMedia,
  deleteMedia: api.deleteMedia,
  
  // Compat Getters (async in components)
  bots: [], 
  campaigns: [],
  assets: [],
  posts: []
};
