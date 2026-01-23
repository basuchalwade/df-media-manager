
import { MediaItem, EnhancementType } from '../types';

export const getEnhancementSuggestions = (media: MediaItem): EnhancementType[] => {
  const suggestions: EnhancementType[] = [];

  if (!media.metadata) return [];

  // Deterministic heuristics based on file properties to simulate AI analysis
  const { width, height, sizeMB } = media.metadata;
  const isImage = media.type === 'image';
  
  // Use id char codes to pseudo-randomly trigger suggestions for demo purposes
  const seed = media.id.charCodeAt(media.id.length - 1);

  if (isImage) {
    // Suggest brightness if "detected" as dark (simulated)
    if (seed % 3 === 0) {
      suggestions.push('auto_brightness');
    }

    // Suggest contrast if "detected" as flat
    if (seed % 4 === 0) {
      suggestions.push('auto_contrast');
    }

    // Always suggest brand overlay for marketing content
    suggestions.push('brand_overlay');

    // Smart crop for very large images
    if (width > 1920 || height > 1920) {
      suggestions.push('smart_crop');
    }
  }

  return suggestions;
};
