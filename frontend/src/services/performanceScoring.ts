
import { PostPerformance } from '../types';

export const calculateCreativeScore = (events: PostPerformance[]): { score: number, trend: 'up' | 'down' | 'stable' } => {
  if (events.length === 0) return { score: 50, trend: 'stable' }; // Base score

  // Sort by date desc
  const sorted = [...events].sort((a, b) => new Date(b.collectedAt).getTime() - new Date(a.collectedAt).getTime());
  
  // Calculate average engagement rate
  const avgEngagement = sorted.reduce((acc, curr) => acc + curr.engagementRate, 0) / sorted.length;
  
  // Recency weighting (simple) - Recent 5 events count for more trend analysis
  const recentEvents = sorted.slice(0, 5);
  const recentAvg = recentEvents.reduce((acc, curr) => acc + curr.engagementRate, 0) / recentEvents.length;

  // Normalized Score (Assuming 0-10% engagement range mapping to 0-100 score)
  // Cap at 100
  let score = Math.min(100, Math.max(0, avgEngagement * 1000)); 
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (events.length > 3) {
      if (recentAvg > avgEngagement * 1.1) trend = 'up';
      else if (recentAvg < avgEngagement * 0.9) trend = 'down';
  }

  return { score, trend };
};
