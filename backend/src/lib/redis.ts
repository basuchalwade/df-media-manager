
import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

/**
 * Shared Redis connection options for BullMQ.
 * maxRetriesPerRequest must be null for BullMQ to handle blocking connections correctly.
 */
export const redisOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  maxRetriesPerRequest: null,
};

// Singleton connection for general Redis usage (if needed outside queues)
const connection = new IORedis(redisOptions);

export default connection;
