
import { botSchedulerWorker } from './botScheduler.worker';
import { actionExecutorWorker } from './actionExecutor.worker';
import { mediaProcessorWorker } from './mediaProcessor.worker';

console.log('🚀 Workers Initialized');

// Error listeners
const workers = [botSchedulerWorker, actionExecutorWorker, mediaProcessorWorker];

workers.forEach(worker => {
  worker.on('failed', (job, err) => {
    if (job) {
      console.error(`❌ Job ${job.id} failed in ${worker.name}: ${err.message}`);
    }
  });
  
  worker.on('error', err => {
    console.error(`❌ Worker ${worker.name} error: ${err.message}`);
  });
});

export const startWorkers = () => {
  // Workers auto-start upon instantiation in BullMQ, 
  // but this function can serve as a hook for health checks or explicit startup logic.
  console.log('Workers are listening for jobs...');
};
