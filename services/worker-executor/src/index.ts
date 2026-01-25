
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

console.log("👷 Worker Executor Service Starting...");

const run = () => {
  setInterval(async () => {
    try {
      // 1. Fetch Bots
      const { data: bots } = await axios.get(`${API_URL}/bots`);
      
      // 2. Simulate Activity for Active Bots
      bots.forEach(async (bot: any) => {
        if (bot.enabled && bot.status === 'Running') {
          // Random chance to act
          if (Math.random() > 0.8) {
            console.log(`[Worker] Executing action for ${bot.type}...`);
            await axios.post(`${API_URL}/bots/${encodeURIComponent(bot.type)}/activity`, {
                botType: bot.type,
                actionType: 'SIMULATION',
                platform: 'Twitter',
                status: 'SUCCESS',
                message: `Worker executed ${bot.type} action automatically.`
            });
          }
        }
      });

    } catch (e) {
      console.error("[Worker] Failed to connect to API Gateway", e);
    }
  }, 5000); 
};

run();
