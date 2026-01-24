
import IORedis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Shared options for both IORedis client and BullMQ
export const redisConnectionOptions = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Critical requirement for BullMQ
};

export const redisOptions = redisConnectionOptions;

// Singleton connection for general usage (caching, etc.)
export const redisConnection = new IORedis(redisConnectionOptions);

redisConnection.on('error', (err) => console.error('[Redis] Client Error', err));
redisConnection.on('connect', () => console.log('[Redis] Connected'));
