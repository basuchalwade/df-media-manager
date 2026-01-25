
import { Platform, MediaItem, ValidationResult } from '../types';

export const PLATFORM_LIMITS: Record<Platform, number> = {
  [Platform.Twitter]: 280,
  [Platform.LinkedIn]: 3000,
  [Platform.Instagram]: 2200,
  [Platform.Facebook]: 63206,
  [Platform.Threads]: 500,
  [Platform.YouTube]: 5000,
  [Platform.GoogleBusiness]: 1500,
};

export const validatePost = (
  content: string, 
  platforms: Platform[], 
  media: MediaItem | null,
  isCarousel: boolean = false,
  youtubeTitle: string = '',
  scheduledDate?: Date
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  platforms.forEach(p => {
    const limit = PLATFORM_LIMITS[p];
    if (content.length > limit) {
      const label = p === Platform.Twitter ? 'X' : p;
      errors.push(`${label}: Text limit exceeded (${content.length}/${limit})`);
    }
    
    if (p === Platform.YouTube) {
      if (!youtubeTitle) errors.push("YouTube: Video title is required.");
      if (!media) errors.push("YouTube: Video file is required.");
      if (media && media.type !== 'video') errors.push("YouTube: Selected media must be a video.");
    }

    if (p === Platform.Instagram) {
       if (!media && !content) errors.push("Instagram: Must include media or text.");
    }

    if (p === Platform.Twitter) {
       if (media && media.size > 5 * 1024 * 1024) { 
          errors.push("X: Image exceeds 5MB limit.");
       }
    }
  });

  if (scheduledDate) {
      const now = new Date();
      const hour = scheduledDate.getHours();
      const day = scheduledDate.getDay(); 

      if (scheduledDate < now) {
          errors.push("Scheduled time is in the past.");
      }

      if (hour >= 22 || hour < 6) {
          warnings.push("Scheduling outside standard engagement hours (10 PM - 6 AM).");
      }

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
