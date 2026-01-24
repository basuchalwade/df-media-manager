
import { BotType, Platform } from '@prisma/client';

export interface BaseJob {
  tenantId: string;
  traceId: string;
}

export interface BotSchedulerJob extends BaseJob {
  campaignId: string;
  triggerSource: 'MANUAL' | 'SCHEDULE' | 'API';
}

export interface ActionExecutorJob extends BaseJob {
  campaignId: string;
  botId: string;
  botType: BotType;
  actionType: 'POST' | 'REPLY' | 'LIKE' | 'FOLLOW' | 'ANALYZE';
  platform?: Platform;
  targetId?: string; // e.g., Post ID to reply to
  payload?: any; // Context specific data
}

export interface MediaProcessorJob extends BaseJob {
  mediaAssetId: string;
  targetPlatforms: Platform[]; // Platforms to generate variants for
}

export const QUEUE_NAMES = {
  BOT_SCHEDULER: 'bot-scheduler',
  ACTION_EXECUTOR: 'action-executor',
  MEDIA_PROCESSOR: 'media-processor',
} as const;
