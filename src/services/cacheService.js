const redis = require('redis');
const logger = require('../utils/logger');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
  }
});

let isConnected = false;

client.on('error', (err) => logger.error({
  message: 'Redis Client Error',
  error: err.message,
  stack: err.stack,
  timestamp: new Date().toISOString()
}));
client.on('ready', () => {
  logger.info({
    message: 'Redis connected',
    timestamp: new Date().toISOString()
  });
  isConnected = true;
});
client.on('end', () => {
  isConnected = false;
  logger.info({
    message: 'Redis disconnected',
    timestamp: new Date().toISOString()
  });
});

const connectPromise = client.connect().catch(err => {
  logger.error({
    message: 'Redis Connection Error',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});

const CACHE_TTL = parseInt(process.env.REDIS_TTL || '3600'); // 1 hour default

class CacheService {
  static async withTimeout(promise, timeout = 1000) {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis operation timeout')), timeout)
    );
    return Promise.race([promise, timeoutPromise]);
  }

  static async getByAccountNumber(accountNumber) {
    if (!isConnected) return null;
    try {
      const data = await this.withTimeout(client.get(`user:account:${accountNumber}`));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error({
        message: 'Redis Get Error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  static async getByRegistrationNumber(registrationNumber) {
    if (!isConnected) return null;
    try {
      const data = await this.withTimeout(client.get(`user:reg:${registrationNumber}`));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error({
        message: 'Redis Get Error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  static async cacheUser(user) {
    if (!isConnected) return;
    try {
      await this.withTimeout(Promise.all([
        client.setEx(`user:account:${user.accountNumber}`, CACHE_TTL, JSON.stringify(user)),
        client.setEx(`user:reg:${user.registrationNumber}`, CACHE_TTL, JSON.stringify(user))
      ]), 2000);
      logger.info({
        message: 'User cached',
        userId: user.userId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.error({
        message: 'Redis Set Error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    }
  }

  static async clearUserCache(user) {
    if (!isConnected) return;
    try {
      await this.withTimeout(Promise.all([
        client.del(`user:account:${user.accountNumber}`),
        client.del(`user:reg:${user.registrationNumber}`)
      ]), 2000);
      logger.info({
        message: 'User cache cleared',
        userId: user.userId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      logger.error({
        message: 'Redis Delete Error',
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = {
  connectPromise,
  CacheService
};
