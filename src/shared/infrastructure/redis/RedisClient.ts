/**
 * Cliente Redis singleton
 * Maneja conexión y operaciones básicas de Redis
 */

import 'reflect-metadata';
import { injectable } from 'inversify';
import Redis from 'ioredis';
import { logger } from '../../utils/logger';

@injectable()
export class RedisClient {
  private client: Redis;
  private publisher: Redis;
  private subscriber: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.publisher = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.subscriber = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    this.publisher.on('error', (error) => {
      logger.error('Redis publisher error', { error: error.message });
    });

    this.subscriber.on('error', (error) => {
      logger.error('Redis subscriber error', { error: error.message });
    });
  }

  getClient(): Redis {
    return this.client;
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async connect(): Promise<void> {
    await Promise.all([
      this.client.connect(),
      this.publisher.connect(),
      this.subscriber.connect(),
    ]);
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.client.quit(),
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }
}

