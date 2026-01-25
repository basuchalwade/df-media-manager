
import { MockQueue } from './queue/mockQueue';
import { runBotCycle } from './jobs/bot.jobs';
import { processMediaQueue } from './jobs/media.jobs';

console.log('👷 Worker Executor Service Starting on Port 5000 (Virtual)...');

// Initialize Queue System
// Request said "bot execution cycles every 30 seconds"
const botQueue = new MockQueue(30000); 
botQueue.register(runBotCycle);

const mediaQueue = new MockQueue(10000); // Check media every 10s
mediaQueue.register(processMediaQueue);

botQueue.start();
mediaQueue.start();

// Keep process alive
(process as any).on('SIGINT', () => {
    botQueue.stop();
    mediaQueue.stop();
    (process as any).exit();
});
