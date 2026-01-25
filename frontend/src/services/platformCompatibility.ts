
import { MediaItem, PlatformCompatibility } from '../types';
import { PLATFORM_RULES } from './platformRules';

export const evaluateCompatibility = (media: MediaItem): Record<string, PlatformCompatibility> => {
  const compatibility: Record<string, PlatformCompatibility> = {};

  if (!media.metadata) {
    Object.keys(PLATFORM_RULES).forEach(key => {
      compatibility[key] = { compatible: false, issues: ['Metadata processing required'] };
    });
    return compatibility;
  }

  const { sizeMB, format, aspectRatio } = media.metadata;
  const mimeTypeBase = format.split('/')[0]; // 'image' or 'video'

  Object.values(PLATFORM_RULES).forEach(rule => {
    const issues: string[] = [];

    // 1. Format Check
    if (rule.requiresVideo && mimeTypeBase !== 'video') {
      issues.push('Video format required');
    }
    if (!rule.allowedFormats.includes(mimeTypeBase as any)) {
      issues.push(`Format ${format} not supported`);
    }

    // 2. Size Check
    if (rule.maxSizeMB && sizeMB > rule.maxSizeMB) {
      issues.push(`File size ${sizeMB.toFixed(1)}MB exceeds limit of ${rule.maxSizeMB}MB`);
    }

    // 3. Aspect Ratio Check
    if (rule.aspectRatioRanges && aspectRatio > 0) {
      const validRatio = rule.aspectRatioRanges.some(([min, max]) => aspectRatio >= min && aspectRatio <= max);
      if (!validRatio) {
        const target = rule.aspectRatioRanges[0];
        issues.push(`Aspect ratio ${aspectRatio.toFixed(2)} is incompatible (Target: ${target[0]}-${target[1]})`);
      }
    }

    compatibility[rule.id] = {
      compatible: issues.length === 0,
      issues
    };
  });

  return compatibility;
};
