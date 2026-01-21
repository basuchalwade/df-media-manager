import { Platform, MediaItem } from '../types';

export const PLATFORM_LIMITS: Record<Platform, number> = {
  [Platform.Twitter]: 280,
  [Platform.LinkedIn]: 3000,
  [Platform.Instagram]: 2200,
  [Platform.Facebook]: 63206,
  [Platform.Threads]: 500,
  [Platform.YouTube]: 5000,
  [Platform.Discord]: 2000,
};

export const validatePost = (
  content: string, 
  platforms: Platform[], 
  media: MediaItem | null,
  isCarousel: boolean = false,
  youtubeTitle: string = ''
): string[] => {
  const errors: string[] = [];

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

  return errors;
};
