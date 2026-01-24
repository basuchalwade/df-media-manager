
/**
 * src/services/ai/memory/StrategyMemoryStore.ts
 * 
 * The persistent storage layer for Campaign Outcomes.
 * 
 * RESPONSIBILITY:
 * - Acts as the "Hippocampus" of the AI system.
 * - Stores episodic memories (CampaignOutcomeSummary).
 * - Provides retrieval methods for analysis.
 * 
 * ARCHITECTURE NOTE:
 * Currently implemented as an in-memory Singleton for MVP.
 * In Production: Replace internal array with PostgreSQL (JSONB) or a Vector DB.
 */

import { CampaignOutcomeSummary, CampaignObjective } from './StrategyMemoryTypes';

class StrategyMemoryStore {
  private static instance: StrategyMemoryStore;
  private outcomes: CampaignOutcomeSummary[] = [];

  private constructor() {}

  public static getInstance(): StrategyMemoryStore {
    if (!StrategyMemoryStore.instance) {
      StrategyMemoryStore.instance = new StrategyMemoryStore();
    }
    return StrategyMemoryStore.instance;
  }

  /**
   * Commits a campaign result to long-term memory.
   * usually called when a campaign completes or hits a milestone.
   */
  public addOutcome(summary: CampaignOutcomeSummary): void {
    // Validate uniqueness if backed by DB
    this.outcomes.push(summary);
    console.log(`[Memory] Stored outcome for campaign: ${summary.campaignId}`);
  }

  public getAllOutcomes(): CampaignOutcomeSummary[] {
    return [...this.outcomes];
  }

  public getOutcomesByObjective(objective: CampaignObjective): CampaignOutcomeSummary[] {
    return this.outcomes.filter(o => o.objective === objective);
  }

  public getOutcomesByPlatform(platform: string): CampaignOutcomeSummary[] {
    return this.outcomes.filter(o => o.platforms.includes(platform));
  }

  public getRecentOutcomes(days: number): CampaignOutcomeSummary[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return this.outcomes.filter(o => 
      new Date(o.endDate) >= cutoff
    );
  }

  // Helper for mock seeding
  public clear(): void {
    this.outcomes = [];
  }
}

export const strategyMemory = StrategyMemoryStore.getInstance();
