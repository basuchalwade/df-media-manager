
import { PostPerformance } from '../types';

let performanceEvents: PostPerformance[] = [];

export const logPerformance = (event: PostPerformance) => {
  performanceEvents.push(event);
};

export const getPerformanceForMedia = (mediaId: string) => {
  return performanceEvents.filter(e => e.mediaId === mediaId);
};

export const getPerformanceForVariant = (variantId: string) => {
  return performanceEvents.filter(e => e.variantId === variantId);
};

export const getAllPerformanceEvents = () => performanceEvents;
