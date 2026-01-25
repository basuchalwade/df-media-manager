
import { BotActionRequest, GlobalPolicyConfig, PolicyCheckResult, Platform, ActionType } from '../types';

export class OrchestrationPolicy {
  
  static checkGlobalPolicy(
    config: GlobalPolicyConfig,
    currentUsage: Record<Platform, Record<ActionType, number>>,
    request: BotActionRequest
  ): PolicyCheckResult {
    
    // 1. Emergency Stop Check
    if (config.emergencyStop) {
      return { allowed: false, reason: "Global Emergency Stop is ACTIVE.", type: 'POLICY' };
    }

    // 2. Quiet Hours Check
    if (config.quietHours.enabled) {
      if (this.isQuietHours(config.quietHours, request.timestamp)) {
        return { allowed: false, reason: "Action blocked during Quiet Hours.", type: 'POLICY' };
      }
    }

    // 3. Platform Limits Check
    const platformLimits = config.platformLimits[request.platform];
    if (platformLimits) {
      const actionLimit = platformLimits[request.actionType];
      if (actionLimit !== undefined) {
        const currentCount = currentUsage[request.platform]?.[request.actionType] || 0;
        if (currentCount >= actionLimit) {
          return { allowed: false, reason: `Daily limit reached for ${request.platform} ${request.actionType}s.`, type: 'POLICY' };
        }
      }
    }

    return { allowed: true, type: 'OK' };
  }

  private static isQuietHours(config: GlobalPolicyConfig['quietHours'], timestampStr: string): boolean {
    const time = new Date(timestampStr);
    
    // Parse start/end times (HH:MM)
    const [startH, startM] = config.startTime.split(':').map(Number);
    const [endH, endM] = config.endTime.split(':').map(Number);

    const currentH = time.getHours();
    const currentM = time.getMinutes();
    const currentTotalMins = currentH * 60 + currentM;
    
    const startTotalMins = startH * 60 + startM;
    const endTotalMins = endH * 60 + endM;

    // Handle overnight ranges (e.g. 22:00 to 06:00)
    if (startTotalMins > endTotalMins) {
      return currentTotalMins >= startTotalMins || currentTotalMins < endTotalMins;
    } else {
      return currentTotalMins >= startTotalMins && currentTotalMins < endTotalMins;
    }
  }
}
