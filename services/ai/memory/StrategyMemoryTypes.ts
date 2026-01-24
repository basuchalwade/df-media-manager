
/**
 * src/services/ai/memory/StrategyMemoryTypes.ts
 * 
 * Defines the schema for Long-Term Strategy Memory.
 * 
 * CONCEPT:
 * Instead of just raw analytics (time-series data), "Memory" stores 
 * semantic summaries of what happened. This mimics episodic memory in humans.
 * 
 * FUTURE:
 * These types map directly to document schemas in a Vector Database (e.g., Pinecone, Weaviate)
 * where 'description' would be embedded for semantic retrieval.
 */

export type CampaignObjective = "REACH" | "ENGAGEMENT" | "TRAFFIC" | "CONVERSIONS";

/**
 * Represents the final "Grade Card" of a completed or mature campaign.
 * It abstracts away daily metrics into high-level performance indicators.
 */
export interface CampaignOutcomeSummary {
  campaignId: string;
  objective: CampaignObjective;
  platforms: string[]; // e.g. ["Twitter", "LinkedIn"]
  botsUsed: string[];  // e.g. ["Creator Bot", "Engagement Bot"]
  
  // Performance Indicators
  avgRoas: number;        // Return on Ad Spend (e.g. 2.5)
  costPerResult: number;  // CPA/CPC
  pacingScore: number;    // 0.0 - 1.0 (1.0 = perfect budget adherence)
  liftPercent: number;    // Estimated lift vs baseline (e.g. 15.5)
  
  // Temporal Metadata
  startDate: Date;
  endDate: Date;
}

/**
 * A generalized rule or insight derived from analyzing multiple outcomes.
 * This acts as the "Wisdom" layer.
 */
export interface StrategyPattern {
  id: string;
  description: string;          // Human-readable insight
  confidence: number;           // 0.0 - 1.0 (How strong is this pattern?)
  evidenceCount: number;        // How many campaigns support this?
  
  // Contextual Tags for Retrieval
  applicableObjectives: CampaignObjective[];
  applicablePlatforms: string[];
}

/**
 * Input context used when asking the Memory engine for advice.
 */
export interface StrategyContext {
  objective: CampaignObjective;
  platform: string;
}
