/**
 * Implementación de DeliveryZone Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IDeliveryZoneRepository,
  CreateDeliveryZoneData,
  UpdateDeliveryZoneData,
} from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaDeliveryZoneRepository implements IDeliveryZoneRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<DeliveryZone | null> {
    const data = await this.prisma.deliveryZone.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string | null, logistics_provider_id?: string | null): Promise<DeliveryZone[]> {
    const where: Prisma.DeliveryZoneWhereInput = {};
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }
    if (logistics_provider_id) {
      where.logistics_provider_id = logistics_provider_id;
    }
    const data = await this.prisma.deliveryZone.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateDeliveryZoneData): Promise<DeliveryZone> {
    const created = await this.prisma.deliveryZone.create({
      data: {
        tenant_id: data.tenant_id,
        logistics_provider_id: data.logistics_provider_id,
        name: data.name,
        boundary: data.boundary,
        base_rate: data.base_rate,
        rate_per_km: data.rate_per_km,
        surge_multiplier: data.surge_multiplier ?? 1.0,
        currency: data.currency ?? 'USD',
        is_active: data.is_active ?? true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateDeliveryZoneData): Promise<DeliveryZone> {
    const updated = await this.prisma.deliveryZone.update({
      where: { id },
      data: {
        name: data.name,
        boundary: data.boundary,
        base_rate: data.base_rate,
        rate_per_km: data.rate_per_km,
        surge_multiplier: data.surge_multiplier,
        currency: data.currency,
        is_active: data.is_active,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryZone.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string | null;
    logistics_provider_id: string | null;
    name: string;
    boundary: string;
    base_rate: Prisma.Decimal | number;
    rate_per_km: Prisma.Decimal | number;
    surge_multiplier: Prisma.Decimal | number;
    currency: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): DeliveryZone {
    return new DeliveryZone(
      data.id,
      data.tenant_id,
      data.logistics_provider_id,
      data.name,
      data.boundary,
      Number(data.base_rate),
      Number(data.rate_per_km),
      Number(data.surge_multiplier),
      data.currency,
      data.is_active,
      data.created_at,
      data.updated_at
    );
  }
}
