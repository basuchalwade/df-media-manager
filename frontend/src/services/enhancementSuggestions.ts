
import { MediaItem, EnhancementType } from '../types';

export const getEnhancementSuggestions = (media: MediaItem): EnhancementType[] => {
  const suggestions: EnhancementType[] = [];
  if (!media.metadata) return [];

  const { width, height } = media.metadata;
  const isImage = media.type === 'image';
  
  const seed = media.id.charCodeAt(media.id.length - 1);

  if (isImage) {
    if (seed % 3 === 0) suggestions.push('auto_brightness');
    if (seed % 4 === 0) suggestions.push('auto_contrast');
    suggestions.push('brand_overlay');
    if (width > 1920 || height > 1920) suggestions.push('smart_crop');
  }

  return suggestions;
};
