
import { Platform, MediaItem, ValidationResult, PlatformConfig } from '../types';

export const validatePost = (
  content: string, 
  targetPlatformIds: Platform[], 
  platformsRegistry: PlatformConfig[],
  media: MediaItem | null,
  isCarousel: boolean = false,
  youtubeTitle: string = '',
  scheduledDate?: Date
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  targetPlatformIds.forEach(pId => {
    const config = platformsRegistry.find(p => p.id === pId);
    if (!config) return;

    const rules = config.validation;

    // Text Limits
    if (content.length > rules.charLimit) {
      errors.push(`${config.name}: Text limit exceeded (${content.length}/${rules.charLimit})`);
    }
    
    // Video Requirements (YouTube)
    if (rules.videoRequired) {
      if (pId === Platform.YouTube && !youtubeTitle) errors.push("YouTube: Video title is required.");
      if (!media) errors.push(`${config.name}: Video file is required.`);
      if (media && media.type !== 'video') errors.push(`${config.name}: Selected media must be a video.`);
    }

    // Media Required (Instagram)
    if (rules.mediaRequired) {
       if (!media && !content) errors.push(`${config.name}: Must include media or text.`);
    }

    // Specific Media Size (Twitter/X)
    if (rules.maxMediaSizeMB) {
       if (media && media.metadata && media.metadata.sizeMB > rules.maxMediaSizeMB) { 
          errors.push(`${config.name}: Media exceeds ${rules.maxMediaSizeMB}MB limit.`);
       }
    }
  });

  // Scheduling Warnings
  if (scheduledDate) {
      const now = new Date();
      const hour = scheduledDate.getHours();
      const day = scheduledDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Warning: Past Scheduling
      if (scheduledDate < now) {
          errors.push("Scheduled time is in the past.");
      }

      // Warning: Late Night Posting
      if (hour >= 22 || hour < 6) {
          warnings.push("Scheduling outside standard engagement hours (10 PM - 6 AM).");
      }

      // Warning: Weekend Posting
      if (day === 0 || day === 6) {
          warnings.push("Scheduling on a weekend. Engagement may be lower for B2B content.");
      }
  }

  return {
      isValid: errors.length === 0,
      errors,
      warnings
  };
};
