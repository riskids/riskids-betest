const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000)
  }
});

let isConnected = false;

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('ready', () => {
  console.log('Redis connected');
  isConnected = true;
});
client.on('end', () => {
  isConnected = false;
  console.log('Redis disconnected');
});

const connectPromise = client.connect().catch(err => {
  console.error('Redis Connection Error:', err);
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
      console.error('Redis Get Error:', err);
      return null;
    }
  }

  static async getByRegistrationNumber(registrationNumber) {
    if (!isConnected) return null;
    try {
      const data = await this.withTimeout(client.get(`user:reg:${registrationNumber}`));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis Get Error:', err);
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
      console.log(`Cached user ${user.userId}`);
    } catch (err) {
      console.error('Redis Set Error:', err);
    }
  }

  static async clearUserCache(user) {
    if (!isConnected) return;
    try {
      await this.withTimeout(Promise.all([
        client.del(`user:account:${user.accountNumber}`),
        client.del(`user:reg:${user.registrationNumber}`)
      ]), 2000);
      console.log(`Cleared cache for user ${user.userId}`);
    } catch (err) {
      console.error('Redis Delete Error:', err);
    }
  }
}

module.exports = {
  connectPromise,
  CacheService
};
