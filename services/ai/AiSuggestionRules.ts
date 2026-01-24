
/**
 * FILE 2: AiSuggestionRules.ts
 * 
 * Implements discrete, deterministic rules for generating marketing suggestions.
 * 
 * DESIGN PHILOSOPHY:
 * - Each rule is a pure function.
 * - Returns null if the condition is not met.
 * - Isolated logic allows for easy unit testing.
 * - Rules are "heuristic-first" but structured to be replaced by ML classifiers later.
 */

import { AiSuggestion, CampaignSnapshot, BotPerformanceSnapshot } from './AiSuggestionTypes';

// --- Rule 1: Budget Pacing Analysis ---
// Detects severe under-spending relative to daily targets.
export function checkBudgetPacing(campaign: CampaignSnapshot): AiSuggestion | null {
  // Logic: If pacing is UNDER and spend is less than 60% of daily budget (simplified check)
  // In a real system, we'd check time-of-day vs spend curve.
  if (campaign.pacingStatus === "UNDER" && campaign.spentToday < (campaign.dailyBudget * 0.6)) {
    return {
      id: `pacing-${Date.now()}`,
      title: "Accelerate Spending",
      impactLevel: "HIGH",
      reasoning: "Campaign is significantly under-pacing. Budget may go unspent.",
      recommendedAction: "Increase bid caps or expand audience targeting."
    };
  }
  return null;
}

// --- Rule 2: Underperforming Bot Detection ---
// Identifies bots that are dragging down campaign performance.
export function checkUnderperformingBots(bots: BotPerformanceSnapshot[]): AiSuggestion | null {
  const weakBots = bots.filter(b => b.status === "ACTIVE" && b.liftPercent < -5);

  if (weakBots.length > 0) {
    const names = weakBots.map(b => b.botName).join(", ");
    return {
      id: `bot-perf-${Date.now()}`,
      title: "Pause Underperforming Bots",
      impactLevel: "MEDIUM",
      reasoning: `${names} are showing negative lift (-5% or worse).`,
      recommendedAction: "Pause these bots to conserve budget for higher performers."
    };
  }
  return null;
}

// --- Rule 3: Platform Opportunity (Instagram) ---
// Suggests adding high-visual platforms for Reach/Engagement objectives.
export function checkPlatformOpportunity(campaign: CampaignSnapshot): AiSuggestion | null {
  const isVisualObjective = campaign.objective === "REACH" || campaign.objective === "ENGAGEMENT";
  // Normalize platform names for comparison
  const hasInstagram = campaign.targetPlatforms.some(p => p.toLowerCase().includes("instagram"));

  if (isVisualObjective && !hasInstagram) {
    return {
      id: `platform-opp-${Date.now()}`,
      title: "Expand to Instagram",
      impactLevel: "MEDIUM",
      reasoning: "Instagram typically yields 40% higher engagement for visual campaigns.",
      recommendedAction: "Enable Instagram placement for this campaign."
    };
  }
  return null;
}
