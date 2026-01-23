
import { Queue } from 'bullmq';
import { config } from '../config/env';

const connection = config.redis;

export const queues = {
  botExecution: new Queue('bot-execution', { connection }),
  learningEngine: new Queue('learning-engine', { connection }),
  mediaProcessing: new Queue('media-processing', { connection })
};
