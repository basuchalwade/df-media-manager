
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
          if (Math.random() > 0.7) {
            console.log(`[Worker] Executing action for ${bot.name}...`);
            await axios.post(`${API_URL}/bots/${bot.id}/activity`, {});
          }
        }
      });

    } catch (e) {
      console.error("[Worker] Failed to connect to API Gateway");
    }
  }, 3000); // Run every 3 seconds
};

run();
