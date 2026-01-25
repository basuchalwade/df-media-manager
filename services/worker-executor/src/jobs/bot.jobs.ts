
import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const runBotCycle = async () => {
  try {
    // 1. Fetch Bots
    const { data: bots } = await axios.get(`${API_URL}/bots`);
    const activeBots = bots.filter((b: any) => b.enabled);

    if (activeBots.length === 0) {
        console.log('[Worker] No active bots to process.');
        return;
    }

    // 2. Process Random Bot
    const randomBot = activeBots[Math.floor(Math.random() * activeBots.length)];
    console.log(`[Worker] Executing cycle for ${randomBot.type}...`);

    // 3. Simulate Action
    const actions = ['POST', 'LIKE', 'REPLY', 'ANALYZE'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    
    // 4. Report to API
    await axios.post(`${API_URL}/bots/${encodeURIComponent(randomBot.type)}/activity`, {
        botType: randomBot.type,
        actionType: randomAction,
        platform: 'Twitter',
        status: 'SUCCESS',
        message: `Worker executed ${randomAction} successfully.`,
    });

    console.log(`[Worker] Updated activity for ${randomBot.type}`);

  } catch (error) {
    console.error('[Worker] Bot Cycle Error:', error);
  }
};
