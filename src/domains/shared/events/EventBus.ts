/**
 * Event Bus simple usando BullMQ
 * Permite comunicación asíncrona entre dominios
 */

import { Queue, Worker } from 'bullmq';
import { env } from '../../../config/env.config';
import { logger } from '../../../shared/utils/logger';

export interface Event {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  source: string;
}

export type EventHandler = (event: Event) => Promise<void>;

class EventBus {
  private queue: Queue<Event>;
  private workers: Map<string, Worker> = new Map();

  constructor() {
    this.queue = new Queue<Event>('events', {
      connection: {
        host: env.REDIS_URL.split('://')[1]?.split(':')[0] || 'localhost',
        port: parseInt(env.REDIS_URL.split(':')[2] || '6379', 10),
      },
    });
  }

  /**
   * Publica un evento
   */
  async publish(event: Event): Promise<void> {
    try {
      await this.queue.add(event.type, event, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
      logger.info('Event published', { eventType: event.type });
    } catch (error) {
      logger.error('Failed to publish event', { error, eventType: event.type });
      throw error;
    }
  }

  /**
   * Suscribe un handler a un tipo de evento
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (this.workers.has(eventType)) {
      logger.warn(`Handler already registered for event type: ${eventType}`);
      return;
    }

    const worker = new Worker<Event>(
      'events',
      async (job) => {
        if (job.data.type === eventType) {
          await handler(job.data);
        }
      },
      {
        connection: {
          host: env.REDIS_URL.split('://')[1]?.split(':')[0] || 'localhost',
          port: parseInt(env.REDIS_URL.split(':')[2] || '6379', 10),
        },
      }
    );

    worker.on('completed', (job) => {
      logger.info('Event processed', { eventType: job.data.type });
    });

    worker.on('failed', (job, err) => {
      logger.error('Event processing failed', {
        eventType: job?.data.type,
        error: err,
      });
    });

    this.workers.set(eventType, worker);
    logger.info('Event handler registered', { eventType });
  }

  /**
   * Cierra todas las conexiones
   */
  async close(): Promise<void> {
    await this.queue.close();
    for (const worker of this.workers.values()) {
      await worker.close();
    }
    this.workers.clear();
  }
}

// Singleton instance
export const eventBus = new EventBus();
