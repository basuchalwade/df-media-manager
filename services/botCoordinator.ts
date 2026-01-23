
import { BotActionRequest, PolicyCheckResult, BotType, ActionType } from '../types';

// Priority Map: Higher number = Higher Priority
const BOT_PRIORITY: Record<BotType, number> = {
  [BotType.Creator]: 100,
  [BotType.Engagement]: 80,
  [BotType.Finder]: 50,
  [BotType.Growth]: 20,
};

export class BotCoordinator {
  
  static checkConflicts(
    recentActions: BotActionRequest[], // History of recent approved actions
    request: BotActionRequest
  ): PolicyCheckResult {
    
    // 1. Target Conflict (e.g. 2 bots targeting same user/post)
    if (request.targetId) {
      const conflict = recentActions.find(a => 
        a.targetId === request.targetId && 
        a.platform === request.platform &&
        // Within last 6 hours? (Simulated window)
        (new Date(request.timestamp).getTime() - new Date(a.timestamp).getTime()) < 21600000 
      );

      if (conflict) {
        // Allow if same bot (e.g. reply thread), block if different bot
        if (conflict.botType !== request.botType) {
           return { 
             allowed: false, 
             reason: `Conflict: ${conflict.botType} already acted on this target recently.`,
             type: 'CONFLICT'
           };
        }
      }
    }

    // 2. Cooldown Enforcement (General)
    // E.g. Don't perform Growth actions if Engagement actions are happening rapidly
    if (request.botType === BotType.Growth) {
       const engagementActivity = recentActions.filter(a => 
          a.botType === BotType.Engagement && 
          (new Date(request.timestamp).getTime() - new Date(a.timestamp).getTime()) < 300000 // 5 mins
       );
       
       if (engagementActivity.length > 5) {
          return { allowed: false, reason: "Deferred: High engagement traffic detected.", type: 'PRIORITY' };
       }
    }

    return { allowed: true, type: 'OK' };
  }

  static getPriority(botType: BotType): number {
    return BOT_PRIORITY[botType] || 0;
  }
}
