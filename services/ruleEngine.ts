
import { BotConfig, BotType, MediaItem, CreatorBotRules, FinderBotRules, GrowthBotRules, EngagementBotRules } from '../types';

export class RuleEngine {
  
  // --- Asset Selection Filtering ---
  static filterAssetsByRules(assets: MediaItem[], botConfig: BotConfig): MediaItem[] {
    // Only Creator Bot uses asset filtering based on topics
    if (botConfig.type !== BotType.Creator) return assets;

    const rules = botConfig.config.rules as CreatorBotRules;
    if (!rules || !rules.topicBlocks) return assets;

    return assets.filter(asset => {
      // Logic: If asset tags contain any blocked topic, exclude it.
      // Logic: If asset tags don't match Bot's content topics (from general config), prioritize correctly (simplified here).
      
      const hasBlockedTopic = asset.tags?.some(tag => 
        rules.topicBlocks.some(block => tag.toLowerCase().includes(block.toLowerCase()))
      );

      return !hasBlockedTopic;
    });
  }

  // --- Configuration Validation ---
  static validateRules(botConfig: BotConfig): string[] {
    const errors: string[] = [];
    
    if (botConfig.type === BotType.Growth) {
      const rules = botConfig.config.rules as GrowthBotRules;
      if (rules && rules.followRatePerHour > 50 && botConfig.config.safetyLevel === 'Conservative') {
        errors.push("Follow rate exceeds safety limits for Conservative mode.");
      }
    }

    return errors;
  }

  // --- Rule Descriptions for UI ---
  static getRuleSummary(botConfig: BotConfig): string {
    const rules = botConfig.config.rules;
    if (!rules) return "No specific rules configured.";

    switch (botConfig.type) {
      case BotType.Finder:
        const finder = rules as FinderBotRules;
        return `Scanning ${finder.keywordSources?.length || 0} sources in ${finder.languages?.join(', ') || 'all languages'}.`;
      
      case BotType.Growth:
        const growth = rules as GrowthBotRules;
        return `Following max ${growth.followRatePerHour}/hr. Unfollow after ${growth.unfollowAfterDays} days.`;
      
      case BotType.Engagement:
        const engage = rules as EngagementBotRules;
        return `Tone: ${engage.replyTone}. Max ${engage.maxRepliesPerHour} replies/hr.`;
      
      case BotType.Creator:
        const creator = rules as CreatorBotRules;
        return `Risk: ${creator.riskLevel}. Blocking ${creator.topicBlocks?.length || 0} topics.`;
        
      default:
        return "Standard configuration.";
    }
  }
}
