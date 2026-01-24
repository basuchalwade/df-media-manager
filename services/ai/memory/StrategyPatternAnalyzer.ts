
/**
 * src/services/ai/memory/StrategyPatternAnalyzer.ts
 * 
 * The analytical engine that "learns" from history.
 * 
 * RESPONSIBILITY:
 * - Scans historical outcomes to find correlations.
 * - Generates "StrategyPattern" objects (Wisdom).
 * - Modifies real-time scoring based on past success/failure.
 * 
 * ML TRANSITION PLAN:
 * 1. Current: Heuristic rules (if ROAS > X then Good).
 * 2. Next: Statistical Regression (Correlation coefficients).
 * 3. Future: Neural Network Classifiers (Unsupervised clustering of success patterns).
 */

import { CampaignOutcomeSummary, StrategyPattern, StrategyContext } from './StrategyMemoryTypes';

// Heuristic Constants
const GOOD_ROAS_THRESHOLD = 2.5;
const HIGH_LIFT_THRESHOLD = 15.0; // percent
const MIN_EVIDENCE_COUNT = 2;     // Need at least 2 instances to form a pattern

export class StrategyPatternAnalyzer {

  /**
   * Main mining function. Runs batch analysis on history.
   */
  static analyzePatterns(outcomes: CampaignOutcomeSummary[]): StrategyPattern[] {
    const patterns: StrategyPattern[] = [];

    // --- Pattern Type 1: Platform Effectiveness ---
    // "Does Platform X consistently deliver for Objective Y?"
    const platformStats = this.groupByPlatformAndObjective(outcomes);
    
    for (const key in platformStats) {
      const { avgRoas, count, objective, platform } = platformStats[key];
      
      if (count >= MIN_EVIDENCE_COUNT && avgRoas > GOOD_ROAS_THRESHOLD) {
        patterns.push({
          id: `pat-plat-${Date.now()}-${Math.random()}`,
          description: `${platform} is highly effective for ${objective} (Avg ROAS: ${avgRoas.toFixed(1)}x).`,
          confidence: Math.min(0.95, 0.5 + (count * 0.1)), // Cap confidence at 0.95
          evidenceCount: count,
          applicableObjectives: [objective as any],
          applicablePlatforms: [platform]
        });
      }
    }

    // --- Pattern Type 2: Bot Synergy ---
    // "Do certain bots work well together?"
    const botStats = this.groupByBotCombination(outcomes);
    
    for (const comboKey in botStats) {
      const { avgLift, count, bots } = botStats[comboKey];
      
      if (count >= MIN_EVIDENCE_COUNT && avgLift > HIGH_LIFT_THRESHOLD) {
        patterns.push({
          id: `pat-bot-${Date.now()}-${Math.random()}`,
          description: `The combination of [${bots.join(' + ')}] yields high brand lift (+${avgLift.toFixed(1)}%).`,
          confidence: Math.min(0.9, 0.6 + (count * 0.05)),
          evidenceCount: count,
          applicableObjectives: ["REACH", "ENGAGEMENT"], // Heuristic: Lift usually maps to these
          applicablePlatforms: [] // Bot patterns often platform-agnostic
        });
      }
    }

    return patterns;
  }

  /**
   * Boosts an AI decision score based on historical memory.
   * 
   * @param baseScore The raw score calculated by the stateless engine (0-100)
   * @param patternsExtracted The wisdom we have available
   * @param context What we are trying to do right now
   */
  static boostScoreByMemory(
    baseScore: number,
    patterns: StrategyPattern[],
    context: StrategyContext
  ): number {
    let multiplier = 1.0;

    // Find relevant patterns
    const relevantPatterns = patterns.filter(p => 
      p.applicableObjectives.includes(context.objective as any) &&
      (p.applicablePlatforms.length === 0 || p.applicablePlatforms.includes(context.platform))
    );

    // Apply Boost
    for (const pat of relevantPatterns) {
      // Logic: High confidence patterns boost score significantly
      // e.g. Confidence 0.8 => +20% score boost (approx)
      multiplier += (pat.confidence * 0.25);
    }

    return Math.min(100, Math.round(baseScore * multiplier));
  }

  // --- Helpers ---

  private static groupByPlatformAndObjective(outcomes: CampaignOutcomeSummary[]) {
    const map: Record<string, { totalRoas: number, count: number, objective: string, platform: string }> = {};

    for (const o of outcomes) {
      for (const p of o.platforms) {
        const key = `${p}|${o.objective}`;
        if (!map[key]) map[key] = { totalRoas: 0, count: 0, objective: o.objective, platform: p };
        map[key].totalRoas += o.avgRoas;
        map[key].count++;
      }
    }

    // Convert total to avg
    const result: Record<string, { avgRoas: number, count: number, objective: string, platform: string }> = {};
    for (const k in map) {
      result[k] = { ...map[k], avgRoas: map[k].totalRoas / map[k].count };
    }
    return result;
  }

  private static groupByBotCombination(outcomes: CampaignOutcomeSummary[]) {
    const map: Record<string, { totalLift: number, count: number, bots: string[] }> = {};

    for (const o of outcomes) {
      if (o.botsUsed.length < 2) continue; // Need combination
      const sortedBots = [...o.botsUsed].sort().join(','); // Create signature
      
      if (!map[sortedBots]) map[sortedBots] = { totalLift: 0, count: 0, bots: o.botsUsed };
      map[sortedBots].totalLift += o.liftPercent;
      map[sortedBots].count++;
    }

    const result: Record<string, { avgLift: number, count: number, bots: string[] }> = {};
    for (const k in map) {
      result[k] = { ...map[k], avgLift: map[k].totalLift / map[k].count };
    }
    return result;
  }
}

/*
 * --- MOCK DATA & USAGE EXAMPLE ---
 * 
 * // 1. Seed Memory Store
 * const outcomes: CampaignOutcomeSummary[] = [
 *   {
 *     campaignId: "c1", objective: "CONVERSIONS", platforms: ["LinkedIn"], botsUsed: ["Creator"],
 *     avgRoas: 3.2, costPerResult: 15, pacingScore: 0.9, liftPercent: 5, startDate: new Date(), endDate: new Date()
 *   },
 *   {
 *     campaignId: "c2", objective: "CONVERSIONS", platforms: ["LinkedIn"], botsUsed: ["Creator"],
 *     avgRoas: 2.8, costPerResult: 18, pacingScore: 0.8, liftPercent: 4, startDate: new Date(), endDate: new Date()
 *   },
 *   {
 *     campaignId: "c3", objective: "REACH", platforms: ["Twitter"], botsUsed: ["Creator", "Engagement"],
 *     avgRoas: 1.1, costPerResult: 2, pacingScore: 1.0, liftPercent: 22, startDate: new Date(), endDate: new Date()
 *   },
 *   {
 *     campaignId: "c4", objective: "REACH", platforms: ["Twitter"], botsUsed: ["Creator", "Engagement"],
 *     avgRoas: 1.2, costPerResult: 2, pacingScore: 1.0, liftPercent: 18, startDate: new Date(), endDate: new Date()
 *   }
 * ];
 * 
 * // 2. Analyze
 * const patterns = StrategyPatternAnalyzer.analyzePatterns(outcomes);
 * console.log(patterns);
 * 
 * // Output Expected:
 * // Pattern 1: "LinkedIn is highly effective for CONVERSIONS (Avg ROAS: 3.0x)."
 * // Pattern 2: "The combination of [Creator + Engagement] yields high brand lift (+20.0%)."
 * 
 * // 3. Apply to Future Decision
 * const baseScore = 60; // AI thinks LinkedIn is okay
 * const boosted = StrategyPatternAnalyzer.boostScoreByMemory(
 *    baseScore, 
 *    patterns, 
 *    { platform: "LinkedIn", objective: "CONVERSIONS" }
 * );
 * console.log(boosted); // Should be higher (e.g. 75-80) because history confirms it.
 */
