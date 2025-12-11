/**
 * Pub/Sub para ubicaciones de drivers en tiempo real
 * Permite suscribirse a actualizaciones de ubicación de drivers específicos o todos
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { RedisClient } from './RedisClient';
import { TYPES } from '../../../config/types';
import { logger } from '../../utils/logger';
import { DriverLocation } from './LocationCache';

export interface LocationMessage {
  driver_id: string;
  location: DriverLocation;
  timestamp: string;
}

@injectable()
export class LocationPubSub {
  private readonly CHANNEL_PREFIX = 'driver:location:';
  private readonly CHANNEL_ALL = 'driver:location:all';

  constructor(@inject(TYPES.RedisClient) private redisClient: RedisClient) {}

  /**
   * Publica la ubicación de un driver
   * Se publica en dos canales:
   * 1. Canal específico del driver: `driver:location:{driver_id}`
   * 2. Canal general: `driver:location:all`
   */
  async publishLocation(driverId: string, location: DriverLocation): Promise<void> {
    try {
      const publisher = this.redisClient.getPublisher();
      const message: LocationMessage = {
        driver_id: driverId,
        location,
        timestamp: new Date().toISOString(),
      };

      const messageStr = JSON.stringify(message);

      // Publicar en canal específico del driver
      await publisher.publish(`${this.CHANNEL_PREFIX}${driverId}`, messageStr);

      // Publicar en canal general (para dispatchers que escuchan todos los drivers)
      await publisher.publish(this.CHANNEL_ALL, messageStr);
    } catch (error) {
      logger.error('Error publishing driver location', {
        driverId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Suscribe a las ubicaciones de un driver específico
   * Retorna un callback para unsubscribe
   */
  async subscribeToDriver(
    driverId: string,
    callback: (message: LocationMessage) => void
  ): Promise<() => Promise<void>> {
    const subscriber = this.redisClient.getSubscriber();
    const channel = `${this.CHANNEL_PREFIX}${driverId}`;

    const messageHandler = (ch: string, message: string) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(message) as LocationMessage;
          callback(parsed);
        } catch (error) {
          logger.error('Error parsing location message', { error });
        }
      }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(channel);

    logger.info('Subscribed to driver location', { driverId, channel });

    return async () => {
      subscriber.off('message', messageHandler);
      await subscriber.unsubscribe(channel);
      logger.info('Unsubscribed from driver location', { driverId, channel });
    };
  }

  /**
   * Suscribe a las ubicaciones de todos los drivers
   * Útil para dispatchers
   */
  async subscribeToAll(
    callback: (message: LocationMessage) => void
  ): Promise<() => Promise<void>> {
    const subscriber = this.redisClient.getSubscriber();

    const messageHandler = (channel: string, message: string) => {
      if (channel === this.CHANNEL_ALL) {
        try {
          const parsed = JSON.parse(message) as LocationMessage;
          callback(parsed);
        } catch (error) {
          logger.error('Error parsing location message', { error });
        }
      }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(this.CHANNEL_ALL);

    logger.info('Subscribed to all driver locations');

    return async () => {
      subscriber.off('message', messageHandler);
      await subscriber.unsubscribe(this.CHANNEL_ALL);
      logger.info('Unsubscribed from all driver locations');
    };
  }
}

