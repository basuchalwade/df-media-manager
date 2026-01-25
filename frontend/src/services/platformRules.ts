
import { Platform } from '../types';

export interface PlatformRule {
  id: Platform;
  label: string;
  maxSizeMB?: number;
  allowedFormats: ('image' | 'video')[];
  aspectRatioRanges?: Array<[number, number]>; // min, max
  requiresVideo?: boolean;
}

export const PLATFORM_RULES: Record<string, PlatformRule> = {
  [Platform.Twitter]: {
    id: Platform.Twitter,
    label: 'X (Twitter)',
    maxSizeMB: 512,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[0.5, 2.0]], // Flexible
  },
  [Platform.Instagram]: {
    id: Platform.Instagram,
    label: 'Instagram',
    maxSizeMB: 100,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[0.8, 1.91]], // 4:5 to 1.91:1
  },
  [Platform.LinkedIn]: {
    id: Platform.LinkedIn,
    label: 'LinkedIn',
    maxSizeMB: 200,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[0.5, 2.4]], // Flexible
  },
  [Platform.YouTube]: {
    id: Platform.YouTube,
    label: 'YouTube',
    maxSizeMB: 2048,
    allowedFormats: ['video'],
    requiresVideo: true,
    aspectRatioRanges: [[1.7, 1.8]], // ~16:9
  },
  [Platform.GoogleBusiness]: {
    id: Platform.GoogleBusiness,
    label: 'Google Business',
    maxSizeMB: 75,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[1.0, 1.5]],
  },
  [Platform.Threads]: {
    id: Platform.Threads,
    label: 'Threads',
    maxSizeMB: 100,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[0.5, 2.0]],
  },
  [Platform.Facebook]: {
    id: Platform.Facebook,
    label: 'Facebook',
    maxSizeMB: 512,
    allowedFormats: ['image', 'video'],
    aspectRatioRanges: [[0.5, 2.0]],
  }
};
