/**
 * Cache de Última Ubicación de Drivers
 * Almacena la última ubicación conocida de cada driver en Redis
 * TTL: 5 minutos (auto-expire si driver offline)
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { RedisClient } from './RedisClient';
import { TYPES } from '../../../config/types';
import { logger } from '../../utils/logger';

export interface DriverLocation {
  driver_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  order_id?: string;
  recorded_at: string;
}

@injectable()
export class LocationCache {
  private readonly TTL_SECONDS = 300; // 5 minutos
  private readonly KEY_PREFIX = 'driver:location:';

  constructor(@inject(TYPES.RedisClient) private redisClient: RedisClient) {}

  /**
   * Guarda la última ubicación de un driver
   */
  async setDriverLocation(driverId: string, location: DriverLocation): Promise<void> {
    try {
      const client = this.redisClient.getClient();
      const key = `${this.KEY_PREFIX}${driverId}`;
      
      await client.setex(
        key,
        this.TTL_SECONDS,
        JSON.stringify(location)
      );
    } catch (error) {
      logger.error('Error setting driver location in cache', {
        driverId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Obtiene la última ubicación de un driver
   */
  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    try {
      const client = this.redisClient.getClient();
      const key = `${this.KEY_PREFIX}${driverId}`;
      
      const data = await client.get(key);
      
      if (!data) {
        return null;
      }

      return JSON.parse(data) as DriverLocation;
    } catch (error) {
      logger.error('Error getting driver location from cache', {
        driverId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }

  /**
   * Obtiene las últimas ubicaciones de múltiples drivers
   */
  async getMultipleDriverLocations(driverIds: string[]): Promise<Map<string, DriverLocation>> {
    const locations = new Map<string, DriverLocation>();

    if (driverIds.length === 0) {
      return locations;
    }

    try {
      const client = this.redisClient.getClient();
      const keys = driverIds.map((id) => `${this.KEY_PREFIX}${id}`);
      
      const values = await client.mget(...keys);

      values.forEach((value, index) => {
        if (value) {
          try {
            const location = JSON.parse(value) as DriverLocation;
            locations.set(driverIds[index], location);
          } catch (parseError) {
            logger.warn('Error parsing driver location from cache', {
              driverId: driverIds[index],
            });
          }
        }
      });
    } catch (error) {
      logger.error('Error getting multiple driver locations from cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return locations;
  }

  /**
   * Elimina la ubicación de un driver del cache
   */
  async deleteDriverLocation(driverId: string): Promise<void> {
    try {
      const client = this.redisClient.getClient();
      const key = `${this.KEY_PREFIX}${driverId}`;
      
      await client.del(key);
    } catch (error) {
      logger.error('Error deleting driver location from cache', {
        driverId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Renueva el TTL de la ubicación de un driver
   */
  async refreshDriverLocationTTL(driverId: string): Promise<void> {
    try {
      const client = this.redisClient.getClient();
      const key = `${this.KEY_PREFIX}${driverId}`;
      
      await client.expire(key, this.TTL_SECONDS);
    } catch (error) {
      logger.error('Error refreshing driver location TTL', {
        driverId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

