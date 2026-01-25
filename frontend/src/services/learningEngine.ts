
import { BotConfig, BotType, OptimizationEvent, LearningStrategy, EngagementBotRules, GrowthBotRules, CreatorBotRules, ActionType, Platform } from '../types';
import { getLearnings } from './learningMemory';

const CONFIDENCE_THRESHOLDS: Record<LearningStrategy, number> = {
    'Conservative': 0.8,
    'Balanced': 0.6,
    'Aggressive': 0.4
};

// Main Analysis Entry Point
export const analyzeBotPerformance = (bot: BotConfig): OptimizationEvent[] => {
    if (!bot.learning?.enabled) return [];

    const suggestions: OptimizationEvent[] = [];
    
    // Dispatch to specific bot analyzers
    if (bot.type === BotType.Engagement) {
        suggestions.push(...analyzeEngagementBot(bot));
    } else if (bot.type === BotType.Growth) {
        suggestions.push(...analyzeGrowthBot(bot));
    } else if (bot.type === BotType.Creator) {
        suggestions.push(...analyzeCreatorBot(bot));
    }

    // Filter by strategy confidence and locked fields
    return suggestions.filter(s => {
        const isLocked = bot.learning?.lockedFields.includes(s.field);
        if (isLocked) return false;

        const threshold = CONFIDENCE_THRESHOLDS[bot.learning?.strategy || 'Balanced'];
        return s.confidence >= threshold;
    });
};

// --- Engagement Bot Analyzer ---
const analyzeEngagementBot = (bot: BotConfig): OptimizationEvent[] => {
    const events: OptimizationEvent[] = [];
    const rules = bot.config.rules as EngagementBotRules;
    if (!rules) return [];

    // Data Source: Recent Reply Performance
    const learnings = getLearnings(Platform.Twitter, ActionType.REPLY); // Using Twitter as primary signal source
    if (learnings.length < 5) return []; // Need data

    const avgScore = learnings.reduce((acc, l) => acc + l.outcomeScore, 0) / learnings.length;

    // Insight 1: Emoji Usage
    if (avgScore < 45 && rules.emojiLevel < 50) {
        const newValue = Math.min(100, rules.emojiLevel + 10);
        events.push(createEvent(bot, 'emojiLevel', rules.emojiLevel, newValue, 
            'Low engagement detected on replies. Increasing emoji usage to boost warmth.', 0.75, ['Reply Engagement Score']));
    }

    // Insight 2: Tone Adjustment
    if (avgScore < 30 && rules.replyTone === 'formal') {
        events.push(createEvent(bot, 'replyTone', 'formal', 'casual', 
            'Formal tone performing poorly. Switching to Casual to improve relatability.', 0.85, ['Reply Engagement Score']));
    }

    // Insight 3: Rate Limiting (Positive Reinforcement)
    if (avgScore > 80 && rules.maxRepliesPerHour < 20) {
        const newValue = Math.min(50, rules.maxRepliesPerHour + 2); // Gradual increase
        events.push(createEvent(bot, 'maxRepliesPerHour', rules.maxRepliesPerHour, newValue, 
            'High success rate on replies. Safely increasing hourly cap to maximize reach.', 0.65, ['Reply Engagement Score']));
    }

    return events;
};

// --- Growth Bot Analyzer ---
const analyzeGrowthBot = (bot: BotConfig): OptimizationEvent[] => {
    const events: OptimizationEvent[] = [];
    const rules = bot.config.rules as GrowthBotRules;
    if (!rules) return [];

    const learnings = getLearnings(undefined, ActionType.FOLLOW);
    if (learnings.length < 5) return [];

    const conversionRate = learnings.reduce((acc, l) => acc + l.outcomeScore, 0) / learnings.length; // outcomeScore maps to follow-back success here

    // Insight 1: Throttle down if low conversion (Anti-Spam)
    if (conversionRate < 20 && rules.followRatePerHour > 5) {
        const newValue = Math.max(2, Math.floor(rules.followRatePerHour * 0.8));
        events.push(createEvent(bot, 'followRatePerHour', rules.followRatePerHour, newValue, 
            'Low follow-back ratio detected. Reducing velocity to preserve account health.', 0.9, ['Follow-Back Ratio']));
    }

    // Insight 2: Scale up if high conversion
    if (conversionRate > 60 && rules.followRatePerHour < 20) {
        const newValue = Math.min(50, rules.followRatePerHour + 2);
        events.push(createEvent(bot, 'followRatePerHour', rules.followRatePerHour, newValue, 
            'Strong follow-back performance. Increasing hourly follow limits.', 0.7, ['Follow-Back Ratio']));
    }

    return events;
};

// --- Creator Bot Analyzer ---
const analyzeCreatorBot = (bot: BotConfig): OptimizationEvent[] => {
    const events: OptimizationEvent[] = [];
    const rules = bot.config.rules as CreatorBotRules;
    if (!rules) return [];

    const learnings = getLearnings(undefined, ActionType.POST);
    if (learnings.length < 5) return [];

    const avgEngagement = learnings.reduce((acc, l) => acc + l.outcomeScore, 0) / learnings.length;

    // Insight 1: Personality Tone
    if (avgEngagement < 40 && rules.personality.tone < 60) {
        const newValue = rules.personality.tone + 10;
        events.push(createEvent(bot, 'personality.tone', rules.personality.tone, newValue, 
            'Content resonance is low. Increasing personality tone for more expressive posts.', 0.6, ['Post Engagement']));
    }

    return events;
};

const createEvent = (
    bot: BotConfig, 
    field: string, 
    oldVal: any, 
    newVal: any, 
    reason: string, 
    confidence: number,
    metrics: string[]
): OptimizationEvent => {
    return {
        id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        timestamp: new Date().toISOString(),
        botId: bot.type,
        field,
        oldValue: oldVal,
        newValue: newVal,
        reason,
        confidence,
        metricsUsed: metrics,
        status: 'pending'
    };
};
