
/**
 * FILE 1: AiSuggestionTypes.ts
 * 
 * Defines the core data structures for the AI Suggestion Engine.
 * These types are designed to be framework-agnostic and easily serializable.
 */

export type SuggestionImpactLevel = "LOW" | "MEDIUM" | "HIGH";

export type CampaignObjective = "REACH" | "ENGAGEMENT" | "TRAFFIC" | "CONVERSIONS";

export type PacingStatus = "UNDER" | "ON_TRACK" | "OVER";

export interface AiSuggestion {
  id: string;
  title: string;
  impactLevel: SuggestionImpactLevel;
  reasoning: string;
  recommendedAction: string;
}

export interface CampaignSnapshot {
  campaignId: string;
  objective: CampaignObjective;
  dailyBudget: number;
  spentToday: number;
  pacingStatus: PacingStatus;
  targetPlatforms: string[];
}

export interface BotPerformanceSnapshot {
  botName: string;
  liftPercent: number; // e.g., 10.5 for +10.5% lift
  spend: number;
  status: "ACTIVE" | "PAUSED";
}
