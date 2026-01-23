
import { MediaItem, PostPerformance } from '../types';

export const detectFatigue = (media: MediaItem, events: PostPerformance[]): { isFatigued: boolean, reason?: string } => {
  if (!events || events.length === 0) return { isFatigued: false };

  // 1. High Frequency Check
  // In a simulation, using total count. In production, check frequency within last 7 days.
  if (events.length > 10) {
      return { isFatigued: true, reason: 'High repetition frequency (Used > 10 times)' };
  }

  // 2. Performance Decline
  if (media.performanceTrend === 'down' && media.performanceScore && media.performanceScore < 40) {
      return { isFatigued: true, reason: 'Engagement declining significantly' };
  }

  return { isFatigued: false };
};
