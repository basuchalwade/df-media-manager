
import { Worker } from 'bullmq';
import { config } from '../config/env';
import { BotExecutorService } from '../services/BotExecutorService';
import { LearningEngineService } from '../services/LearningEngineService';

const connection = config.redis;
const botService = new BotExecutorService();
const learningService = new LearningEngineService();

console.log('🚀 Workers started...');

// Worker 1: Execute Bots
new Worker('bot-execution', async (job) => {
  console.log(`[Worker] Processing Bot: ${job.data.botId}`);
  await botService.executeBotCycle(job.data.botId, job.data.type);
}, { connection });

// Worker 2: Learning Analysis
new Worker('learning-engine', async (job) => {
  console.log(`[Worker] Running Learning Analysis for Bot: ${job.data.botId}`);
  await learningService.analyzePerformance(job.data.botId);
}, { connection });
