
import { MediaItem, PlatformCompatibility, PlatformConfig } from '../types';

export const evaluateCompatibility = (media: MediaItem, platforms: PlatformConfig[]): Record<string, PlatformCompatibility> => {
  const compatibility: Record<string, PlatformCompatibility> = {};

  if (!media.metadata) {
    // If no metadata, assume indeterminate or not ready
    platforms.forEach(p => {
      compatibility[p.id] = { compatible: false, issues: ['Metadata processing required'] };
    });
    return compatibility;
  }

  const { sizeMB, format, aspectRatio } = media.metadata;
  const mimeTypeBase = format.split('/')[0]; // 'image' or 'video'

  platforms.forEach(platform => {
    const rules = platform.validation;
    const issues: string[] = [];

    // 1. Format Check
    if (rules.videoRequired && mimeTypeBase !== 'video') {
      issues.push('Video format required');
    }
    if (rules.allowedFormats && !rules.allowedFormats.includes(mimeTypeBase as any)) {
      issues.push(`Format ${format} not supported`);
    }

    // 2. Size Check
    if (rules.maxMediaSizeMB && sizeMB > rules.maxMediaSizeMB) {
      issues.push(`File size ${sizeMB.toFixed(1)}MB exceeds limit of ${rules.maxMediaSizeMB}MB`);
    }

    // 3. Aspect Ratio Check
    if (rules.aspectRatioRanges && aspectRatio > 0) {
      const validRatio = rules.aspectRatioRanges.some(([min, max]) => aspectRatio >= min && aspectRatio <= max);
      if (!validRatio) {
        // Find closest acceptable ratio for helpful message
        const target = rules.aspectRatioRanges[0];
        issues.push(`Aspect ratio ${aspectRatio.toFixed(2)} is incompatible (Target: ${target[0]}-${target[1]})`);
      }
    }

    compatibility[platform.id] = {
      compatible: issues.length === 0,
      issues
    };
  });

  return compatibility;
};
