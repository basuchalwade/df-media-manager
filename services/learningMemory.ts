
import { LearningEntry, Platform, ActionType } from '../types';

let memory: LearningEntry[] = [];

// Seed initial memory for demo
const seedData: LearningEntry[] = [
    { id: '1', platform: Platform.Twitter, actionType: ActionType.POST, context: 'Tone: Professional', outcomeScore: 45, timestamp: Date.now() - 86400000 * 2 },
    { id: '2', platform: Platform.Twitter, actionType: ActionType.POST, context: 'Tone: Witty', outcomeScore: 85, timestamp: Date.now() - 86400000 * 1 },
    { id: '3', platform: Platform.LinkedIn, actionType: ActionType.POST, context: 'Tone: Professional', outcomeScore: 90, timestamp: Date.now() - 86400000 * 1 },
];

if (memory.length === 0) {
    memory = [...seedData];
}

export const recordLearning = (entry: Omit<LearningEntry, 'id'>) => {
    const newEntry = { ...entry, id: `learn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
    memory.push(newEntry);
    // Keep last 1000 entries
    if (memory.length > 1000) memory.shift();
};

export const getLearnings = (platform?: Platform, actionType?: ActionType) => {
    return memory.filter(m => 
        (!platform || m.platform === platform) && 
        (!actionType || m.actionType === actionType)
    );
};

export const getBestPerformingContext = (platform: Platform, actionType: ActionType): string | null => {
    const relevant = getLearnings(platform, actionType);
    if (relevant.length === 0) return null;

    // Simple analysis: Find context with highest average score
    const scores: Record<string, { total: number, count: number }> = {};
    
    relevant.forEach(r => {
        if (!scores[r.context]) scores[r.context] = { total: 0, count: 0 };
        scores[r.context].total += r.outcomeScore;
        scores[r.context].count += 1;
    });

    let bestContext = null;
    let bestAvg = -1;

    Object.entries(scores).forEach(([ctx, data]) => {
        const avg = data.total / data.count;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestContext = ctx;
        }
    });

    return bestContext;
};
