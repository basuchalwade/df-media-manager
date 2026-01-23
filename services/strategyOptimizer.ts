
import { BotConfig, BotType, OptimizationSuggestion, StrategyMode, StrategyProfile, CreatorBotRules, EngagementBotRules, GrowthBotRules } from '../types';
import { getBestPerformingContext } from './learningMemory';

const PROFILES: Record<StrategyMode, StrategyProfile> = {
    'Conservative': { mode: 'Conservative', postFrequencyMultiplier: 0.8, engagementIntensity: 0.5, growthAggression: 0.3, riskTolerance: 20 },
    'Balanced': { mode: 'Balanced', postFrequencyMultiplier: 1.0, engagementIntensity: 1.0, growthAggression: 1.0, riskTolerance: 50 },
    'Aggressive': { mode: 'Aggressive', postFrequencyMultiplier: 1.5, engagementIntensity: 2.0, growthAggression: 1.8, riskTolerance: 85 },
};

export const getStrategyProfile = (mode: StrategyMode): StrategyProfile => PROFILES[mode];

export const analyzePerformance = (
    bot: BotConfig, 
    activeMode: StrategyMode
): OptimizationSuggestion | null => {
    const profile = PROFILES[activeMode];
    const suggestions: OptimizationSuggestion[] = [];

    // --- 1. Engagement Bot Tuning ---
    if (bot.type === BotType.Engagement) {
        const rules = bot.config.rules as EngagementBotRules;
        if (!rules) return null;

        // If Aggressive mode, suggest increasing replies if current setting is low
        if (activeMode === 'Aggressive' && rules.maxRepliesPerHour < 15) {
            suggestions.push({
                id: `opt-${Date.now()}`,
                botType: BotType.Engagement,
                parameter: 'Replies/Hour',
                oldValue: rules.maxRepliesPerHour,
                newValue: Math.min(20, Math.ceil(rules.maxRepliesPerHour * profile.engagementIntensity)),
                reason: 'Aggressive strategy allows higher engagement volume.',
                impact: 'High',
                applied: false,
                timestamp: new Date().toISOString()
            });
        }
        
        // If Conservative mode, reduce emoji level if too high
        if (activeMode === 'Conservative' && rules.emojiLevel > 30) {
             suggestions.push({
                id: `opt-${Date.now()}`,
                botType: BotType.Engagement,
                parameter: 'Emoji Level',
                oldValue: rules.emojiLevel,
                newValue: 20,
                reason: 'Conservative profile prefers professional tone.',
                impact: 'Low',
                applied: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // --- 2. Growth Bot Tuning ---
    if (bot.type === BotType.Growth) {
        const rules = bot.config.rules as GrowthBotRules;
        if (!rules) return null;

        // Tune Follow Rate based on mode
        const targetRate = Math.floor(10 * profile.growthAggression); // Base 10
        if (rules.followRatePerHour < targetRate) {
             suggestions.push({
                id: `opt-${Date.now()}`,
                botType: BotType.Growth,
                parameter: 'Follow Rate',
                oldValue: rules.followRatePerHour,
                newValue: targetRate,
                reason: `Optimizing for ${activeMode} growth targets.`,
                impact: 'Medium',
                applied: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // --- 3. Creator Bot Tone Tuning (Learning-Based) ---
    if (bot.type === BotType.Creator) {
        const rules = bot.config.rules as CreatorBotRules;
        // Mock checking "Learning Memory"
        // In a real app, we'd query `getBestPerformingContext` here
        // For demo, we simulate a finding:
        if (Math.random() > 0.7 && rules.personality.tone < 50 && activeMode !== 'Conservative') {
             suggestions.push({
                id: `opt-${Date.now()}`,
                botType: BotType.Creator,
                parameter: 'Tone Personality',
                oldValue: rules.personality.tone,
                newValue: rules.personality.tone + 10,
                reason: 'Audience responds better to casual/witty content recently.',
                impact: 'Medium',
                applied: false,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Return the most impactful suggestion or null
    return suggestions.length > 0 ? suggestions[0] : null;
};
