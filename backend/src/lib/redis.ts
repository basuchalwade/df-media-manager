
import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

/**
 * Shared Redis Configuration.
 * BullMQ requires `maxRetriesPerRequest: null` to function correctly.
 */
export const redisConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, 
  enableReadyCheck: false,
};

// Export raw options for BullMQ
export const redisOptions = redisConnectionOptions;

// Singleton connection for general app usage (Caching, PubSub)
export const redisConnection = new IORedis(redisConnectionOptions);

redisConnection.on('error', (err) => console.error('[Redis] Client Error', err));
redisConnection.on('connect', () => console.log('[Redis] Connected'));
