
import { 
    Campaign, 
    CampaignObjective, 
    BudgetPacing, 
    BotAttribution, 
    CampaignRecommendation, 
    BotType,
    PacingStatus
} from '../types';

/**
 * Maps abstract campaign objectives to concrete metrics
 */
export const getKPIsForObjective = (objective: CampaignObjective): Record<string, string> => {
    switch (objective) {
        case CampaignObjective.Reach:
            return {
                "Primary Metric": "Impressions",
                "Secondary Metric": "CPM (Cost Per Mille)",
                "Efficiency": "Cost per 1k Accounts Reached"
            };
        case CampaignObjective.Engagement:
            return {
                "Primary Metric": "Engagement Rate",
                "Secondary Metric": "Total Interactions",
                "Efficiency": "Cost per Engagement (CPE)"
            };
        case CampaignObjective.Traffic:
            return {
                "Primary Metric": "Link Clicks",
                "Secondary Metric": "CTR (Click-Through Rate)",
                "Efficiency": "Cost per Click (CPC)"
            };
        case CampaignObjective.Conversions:
            return {
                "Primary Metric": "Conversions",
                "Secondary Metric": "ROAS (Return on Ad Spend)",
                "Efficiency": "Cost per Action (CPA)"
            };
        default:
            return { "Primary Metric": "Activity Volume" };
    }
};

/**
 * Calculates budget pacing health
 */
export const calculatePacing = (campaign: Campaign): BudgetPacing => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    // If no end date, assume 30 days from start for calculation context
    const end = campaign.endDate ? new Date(campaign.endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const totalDuration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDuration - elapsed);

    // If campaign hasn't started
    if (elapsed <= 0) {
        return {
            expectedSpend: 0,
            actualSpend: 0,
            pacingStatus: 'OPTIMAL',
            burnRate: 0,
            daysRemaining: totalDuration
        };
    }

    const expectedSpend = (campaign.budget.total / totalDuration) * elapsed;
    const actualSpend = campaign.budget.spent;
    const deviation = actualSpend - expectedSpend;
    const deviationPercent = (deviation / expectedSpend) * 100;

    let pacingStatus: PacingStatus = 'OPTIMAL';
    if (deviationPercent > 15) pacingStatus = 'OVER';
    else if (deviationPercent < -15) pacingStatus = 'UNDER';

    const burnRate = (actualSpend / elapsed) / campaign.budget.daily * 100; // % of daily budget used on avg

    return {
        expectedSpend,
        actualSpend,
        pacingStatus,
        burnRate,
        daysRemaining
    };
};

/**
 * Attributes performance to specific bots based on their function
 */
export const attributeBotPerformance = (campaign: Campaign): BotAttribution[] => {
    const bots = campaign.botIds;
    const attribution: BotAttribution[] = [];
    const totalSpend = campaign.budget.spent;

    // Deterministic Logic: Distribute spend/impact based on bot roles & campaign metrics
    // In a real ML system, this would be regression analysis. Here it's rule-based heuristic.
    
    bots.forEach(botId => {
        let weight = 0.25; // Default even split
        let impactScore = 50;
        let lift = 0;
        let primaryContribution = "General Activity";

        switch (botId) {
            case BotType.Creator:
                // Heavy lifter for Reach & Traffic
                weight = 0.4;
                impactScore = campaign.objective === CampaignObjective.Reach ? 90 : 70;
                lift = 12.5;
                primaryContribution = "Content Impressions";
                break;
            case BotType.Engagement:
                // Key for Engagement
                weight = 0.2;
                impactScore = campaign.objective === CampaignObjective.Engagement ? 95 : 60;
                lift = 24.2;
                primaryContribution = "Community Replies";
                break;
            case BotType.Growth:
                // Assist for Reach & Conversions
                weight = 0.2;
                impactScore = 65;
                lift = 8.4;
                primaryContribution = "New Follower Acquisition";
                break;
            case BotType.Finder:
                // Low spend, high strategic value
                weight = 0.2;
                impactScore = 60;
                lift = 5.1;
                primaryContribution = "Trend Discovery";
                break;
        }

        // Adjust for specific campaign
        const botSpend = totalSpend * weight;
        
        attribution.push({
            botId,
            spend: botSpend,
            impactScore,
            liftPercentage: lift,
            primaryContribution
        });
    });

    return attribution;
};

/**
 * Generates actionable AI suggestions based on pacing and attribution
 */
export const generateSuggestions = (
    campaign: Campaign, 
    pacing: BudgetPacing, 
    attribution: BotAttribution[]
): CampaignRecommendation[] => {
    const suggestions: CampaignRecommendation[] = [];

    // 1. Pacing Rules
    if (pacing.pacingStatus === 'UNDER') {
        suggestions.push({
            id: `rec-pacing-${Date.now()}`,
            type: 'budget',
            title: 'Accelerate Spend',
            description: `Campaign is under-pacing by $${(pacing.expectedSpend - pacing.actualSpend).toFixed(0)}. Consider increasing daily caps or activating Aggressive Mode on Engagement Bots.`,
            impact: 'High',
            actionLabel: 'Boost Budget 15%',
            status: 'pending'
        });
    } else if (pacing.pacingStatus === 'OVER') {
        suggestions.push({
            id: `rec-pacing-${Date.now()}`,
            type: 'budget',
            title: 'Control Burn Rate',
            description: `Spending is 15% above schedule. Recommend pausing Finder Bot during off-hours to conserve budget.`,
            impact: 'Medium',
            actionLabel: 'Trim Non-Essential',
            status: 'pending'
        });
    }

    // 2. Attribution Rules
    const lowPerforming = attribution.filter(a => a.impactScore < 60);
    if (lowPerforming.length > 0) {
        const botName = lowPerforming[0].botId;
        suggestions.push({
            id: `rec-perf-${Date.now()}`,
            type: 'bot_config',
            title: `Optimize ${botName}`,
            description: `${botName} is showing lower impact scores compared to peers. Review target keywords or safety settings.`,
            impact: 'Medium',
            actionLabel: 'Re-Configure Bot',
            status: 'pending'
        });
    }

    // 3. Objective Rules
    if (campaign.objective === CampaignObjective.Traffic && !campaign.platforms.includes('Twitter' as any)) {
         suggestions.push({
            id: `rec-obj-${Date.now()}`,
            type: 'platform',
            title: 'Expand to X (Twitter)',
            description: 'Link click-through rates are typically 40% higher on X for this campaign type.',
            impact: 'High',
            actionLabel: 'Enable X Platform',
            status: 'pending'
        });
    }

    return suggestions;
};

/**
 * Master function to enrich a campaign with intelligence data
 */
export const enrichCampaignWithIntelligence = (campaign: Campaign): Campaign => {
    const kpiMapping = getKPIsForObjective(campaign.objective);
    const pacing = calculatePacing(campaign);
    const attribution = attributeBotPerformance(campaign);
    
    // Generate new suggestions, but merge with existing pending ones to avoid overwriting user actions
    const newSuggestions = generateSuggestions(campaign, pacing, attribution);
    const existingIds = new Set(campaign.aiRecommendations.map(r => r.id)); // Simple dedup by ID structure or logic
    // For mock purposes, we just check if we have enough suggestions
    const finalSuggestions = [...campaign.aiRecommendations];
    if (finalSuggestions.length < 2 && newSuggestions.length > 0) {
        // Add one unique new one
        if (!finalSuggestions.some(s => s.title === newSuggestions[0].title)) {
            finalSuggestions.push(newSuggestions[0]);
        }
    }

    const strategySummary = `The ${campaign.botIds.join(' & ')} are coordinating to maximize ${kpiMapping["Primary Metric"]}. Spending is ${pacing.pacingStatus.toLowerCase()} relative to the timeline.`;

    return {
        ...campaign,
        aiRecommendations: finalSuggestions,
        intelligence: {
            pacing,
            attribution,
            kpiMapping,
            strategySummary
        }
    };
};
