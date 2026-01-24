
/**
 * FILE 3: AiSuggestionEngine.ts
 * 
 * The central engine that orchestrates rule execution.
 * 
 * WHY RULE-BASED FIRST?
 * 1. Explainability: Marketers need to trust WHY a suggestion is made.
 * 2. Speed: Deterministic rules execute in microseconds.
 * 3. Cold Start: Works without historical training data.
 * 
 * FUTURE ML EVOLUTION:
 * - Replace hardcoded thresholds (e.g., "-5% lift") with dynamic models.
 * - Use Reinforcement Learning to weight rules based on user acceptance rate.
 * 
 * NOTE ON EXECUTION:
 * Suggestions are advisory. We do not auto-execute to prevent "runaway bot" scenarios
 * and ensure human-in-the-loop oversight for budget decisions.
 */

import { AiSuggestion, CampaignSnapshot, BotPerformanceSnapshot } from './AiSuggestionTypes';
import { checkBudgetPacing, checkUnderperformingBots, checkPlatformOpportunity } from './AiSuggestionRules';

export class AiSuggestionEngine {
  
  /**
   * Generates a list of strategic suggestions based on current state.
   */
  static generateSuggestions(
    campaign: CampaignSnapshot, 
    bots: BotPerformanceSnapshot[]
  ): AiSuggestion[] {
    const suggestions: AiSuggestion[] = [];

    // 1. Run Pacing Rule
    const pacingSuggestion = checkBudgetPacing(campaign);
    if (pacingSuggestion) suggestions.push(pacingSuggestion);

    // 2. Run Bot Performance Rule
    const botSuggestion = checkUnderperformingBots(bots);
    if (botSuggestion) suggestions.push(botSuggestion);

    // 3. Run Platform Opportunity Rule
    const platformSuggestion = checkPlatformOpportunity(campaign);
    if (platformSuggestion) suggestions.push(platformSuggestion);

    return suggestions;
  }
}

// --- MOCK DATA & EXAMPLE USAGE (For Documentation) ---

/*
const mockCampaign: CampaignSnapshot = {
  campaignId: "camp-123",
  objective: "ENGAGEMENT",
  dailyBudget: 100,
  spentToday: 45, // Under 60%
  pacingStatus: "UNDER",
  targetPlatforms: ["Twitter", "LinkedIn"] // Missing Instagram
};

const mockBots: BotPerformanceSnapshot[] = [
  { botName: "Creator Bot", liftPercent: 12.5, spend: 30, status: "ACTIVE" },
  { botName: "Growth Bot", liftPercent: -8.2, spend: 15, status: "ACTIVE" } // Underperforming
];

const results = AiSuggestionEngine.generateSuggestions(mockCampaign, mockBots);

console.log(JSON.stringify(results, null, 2));

// Expected Output:
// [
//   {
//     "title": "Accelerate Spending",
//     "impactLevel": "HIGH",
//     "reasoning": "Campaign is significantly under-pacing...",
//     "recommendedAction": "Increase bid caps..."
//   },
//   {
//     "title": "Pause Underperforming Bots",
//     "impactLevel": "MEDIUM",
//     "reasoning": "Growth Bot are showing negative lift...",
//     "recommendedAction": "Pause these bots..."
//   },
//   {
//     "title": "Expand to Instagram",
//     "impactLevel": "MEDIUM",
//     "reasoning": "Instagram typically yields 40% higher engagement...",
//     "recommendedAction": "Enable Instagram placement..."
//   }
// ]
*/
