
import { 
    Campaign, 
    CampaignObjective, 
    BudgetPacing, 
    BotAttribution, 
    CampaignRecommendation, 
    BotType,
    PacingStatus
} from '../types';

export const getKPIsForObjective = (objective: CampaignObjective): Record<string, string> => {
    switch (objective) {
        case CampaignObjective.Reach:
            return { "Primary Metric": "Impressions", "Secondary Metric": "CPM", "Efficiency": "Cost per 1k" };
        case CampaignObjective.Engagement:
            return { "Primary Metric": "Engagement Rate", "Secondary Metric": "Interactions", "Efficiency": "CPE" };
        case CampaignObjective.Traffic:
            return { "Primary Metric": "Link Clicks", "Secondary Metric": "CTR", "Efficiency": "CPC" };
        case CampaignObjective.Conversions:
            return { "Primary Metric": "Conversions", "Secondary Metric": "ROAS", "Efficiency": "CPA" };
        default:
            return { "Primary Metric": "Activity Volume" };
    }
};

export const calculatePacing = (campaign: Campaign): BudgetPacing => {
    const now = new Date();
    const start = new Date(campaign.startDate);
    const end = campaign.endDate ? new Date(campaign.endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const totalDuration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.max(0, (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDuration - elapsed);

    if (elapsed <= 0) return { expectedSpend: 0, actualSpend: 0, pacingStatus: 'OPTIMAL', burnRate: 0, daysRemaining: totalDuration };

    const expectedSpend = (campaign.budget.total / totalDuration) * elapsed;
    const actualSpend = campaign.budget.spent;
    const deviation = actualSpend - expectedSpend;
    const deviationPercent = (deviation / expectedSpend) * 100;

    let pacingStatus: PacingStatus = 'OPTIMAL';
    if (deviationPercent > 15) pacingStatus = 'OVER';
    else if (deviationPercent < -15) pacingStatus = 'UNDER';

    const burnRate = (actualSpend / elapsed) / campaign.budget.daily * 100;

    return { expectedSpend, actualSpend, pacingStatus, burnRate, daysRemaining };
};

export const attributeBotPerformance = (campaign: Campaign): BotAttribution[] => {
    const bots = campaign.botIds;
    const totalSpend = campaign.budget.spent;
    const attribution: BotAttribution[] = [];

    bots.forEach(botId => {
        let weight = 0.25; 
        let impactScore = 50;
        let lift = 0;
        let primaryContribution = "General Activity";

        switch (botId) {
            case BotType.Creator: weight = 0.4; impactScore = 80; lift = 12.5; primaryContribution = "Content Impressions"; break;
            case BotType.Engagement: weight = 0.2; impactScore = 90; lift = 24.2; primaryContribution = "Community Replies"; break;
            case BotType.Growth: weight = 0.2; impactScore = 65; lift = 8.4; primaryContribution = "Acquisition"; break;
            case BotType.Finder: weight = 0.2; impactScore = 60; lift = 5.1; primaryContribution = "Discovery"; break;
        }

        attribution.push({ botId, spend: totalSpend * weight, impactScore, liftPercentage: lift, primaryContribution });
    });

    return attribution;
};

export const generateSuggestions = (campaign: Campaign, pacing: BudgetPacing): CampaignRecommendation[] => {
    const suggestions: CampaignRecommendation[] = [];
    if (pacing.pacingStatus === 'UNDER') {
        suggestions.push({
            id: `rec-${Date.now()}`,
            type: 'budget',
            title: 'Accelerate Spend',
            description: 'Campaign is under-pacing. Increase daily caps.',
            impact: 'High',
            actionLabel: 'Boost Budget',
            status: 'pending'
        });
    }
    return suggestions;
};

export const enrichCampaignWithIntelligence = (campaign: Campaign): Campaign => {
    const kpiMapping = getKPIsForObjective(campaign.objective);
    const pacing = calculatePacing(campaign);
    const attribution = attributeBotPerformance(campaign);
    const newSuggestions = generateSuggestions(campaign, pacing);
    
    return {
        ...campaign,
        aiRecommendations: [...campaign.aiRecommendations, ...newSuggestions].slice(0, 5), // Keep limited
        intelligence: { pacing, attribution, kpiMapping, strategySummary: "Campaign is optimizing." }
    };
};
