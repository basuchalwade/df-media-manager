
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
      errors.push(`${p}: Text limit exceeded (${content.length}/${limit})`);
    }
    
    // YouTube Rules
    if (p === Platform.YouTube) {
      if (!youtubeTitle) errors.push("YouTube: Video title is required.");
      if (!media) errors.push("YouTube: Video file is required.");
      if (media && media.type !== 'video') errors.push("YouTube: Selected media must be a video.");
    }

    // Instagram Rules
    if (p === Platform.Instagram) {
       if (!media && !content) errors.push("Instagram: Must include media or text.");
    }

    // Twitter Rules
    if (p === Platform.Twitter) {
       if (media && media.size > 5 * 1024 * 1024) { // 5MB limit
          errors.push("Twitter: Image exceeds 5MB limit.");
       }
    }
  });

  // Scheduling Warnings
  if (scheduledDate) {
      const now = new Date();
      const hour = scheduledDate.getHours();
      const day = scheduledDate.getDay(); // 0 = Sunday, 6 = Saturday

      // Warning: Past Scheduling (though UI usually blocks, sometimes race conditions occur)
      if (scheduledDate < now) {
          errors.push("Scheduled time is in the past.");
      }

      // Warning: Late Night Posting
      // Assuming 'Late Night' is between 10 PM (22) and 6 AM (6)
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
