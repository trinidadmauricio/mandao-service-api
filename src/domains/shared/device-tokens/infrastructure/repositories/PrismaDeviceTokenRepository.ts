/**
 * Implementación de Device Token Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IDeviceTokenRepository,
  DeviceToken,
  CreateDeviceTokenData,
} from '../../domain/repositories/IDeviceTokenRepository';
import { TYPES } from '../../../../../config/types';
import { logger } from '../../../../../shared/utils/logger';

@injectable()
export class PrismaDeviceTokenRepository implements IDeviceTokenRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findByToken(token: string): Promise<DeviceToken | null> {
    const data = await this.prisma.userDeviceToken.findUnique({
      where: { token },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findActiveByUserId(userId: string): Promise<DeviceToken[]> {
    const data = await this.prisma.userDeviceToken.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    return data.map((d) => this.toDomain(d));
  }

  async findActiveByUserIds(userIds: string[]): Promise<DeviceToken[]> {
    if (userIds.length === 0) {
      return [];
    }

    const data = await this.prisma.userDeviceToken.findMany({
      where: {
        user_id: { in: userIds },
        is_active: true,
      },
    });

    return data.map((d) => this.toDomain(d));
  }

  async upsert(data: CreateDeviceTokenData): Promise<DeviceToken> {
    const result = await this.prisma.userDeviceToken.upsert({
      where: { token: data.token },
      update: {
        user_id: data.user_id,
        platform: data.platform,
        device_info: data.device_info as Prisma.InputJsonValue ?? Prisma.JsonNull,
        is_active: true,
        updated_at: new Date(),
      },
      create: {
        user_id: data.user_id,
        token: data.token,
        platform: data.platform,
        device_info: data.device_info as Prisma.InputJsonValue ?? Prisma.JsonNull,
        is_active: true,
      },
    });

    logger.info('Device token upserted', {
      userId: data.user_id,
      platform: data.platform,
      tokenPrefix: data.token.substring(0, 10),
    });

    return this.toDomain(result);
  }

  async deactivate(token: string): Promise<void> {
    await this.prisma.userDeviceToken.updateMany({
      where: { token },
      data: { is_active: false },
    });

    logger.info('Device token deactivated', {
      tokenPrefix: token.substring(0, 10),
    });
  }

  async deactivateAllByUserId(userId: string): Promise<number> {
    const result = await this.prisma.userDeviceToken.updateMany({
      where: { user_id: userId, is_active: true },
      data: { is_active: false },
    });

    logger.info('All device tokens deactivated for user', {
      userId,
      count: result.count,
    });

    return result.count;
  }

  async deleteInactiveOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.prisma.userDeviceToken.deleteMany({
      where: {
        is_active: false,
        updated_at: { lt: cutoffDate },
      },
    });

    logger.info('Deleted inactive device tokens', {
      count: result.count,
      olderThanDays: days,
    });

    return result.count;
  }

  private toDomain(data: {
    id: string;
    user_id: string;
    token: string;
    platform: string;
    device_info: Prisma.JsonValue;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): DeviceToken {
    return {
      id: data.id,
      user_id: data.user_id,
      token: data.token,
      platform: data.platform as 'ios' | 'android' | 'web',
      device_info: data.device_info as Record<string, unknown> | null,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}

