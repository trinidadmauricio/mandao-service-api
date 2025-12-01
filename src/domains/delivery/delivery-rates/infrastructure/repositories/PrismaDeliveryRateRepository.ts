/**
 * Implementación de DeliveryRate Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IDeliveryRateRepository,
  CreateDeliveryRateData,
  UpdateDeliveryRateData,
} from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate, VehicleType } from '../../domain/entities/DeliveryRate';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaDeliveryRateRepository implements IDeliveryRateRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<DeliveryRate | null> {
    const data = await this.prisma.deliveryRate.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string, zone_id?: string): Promise<DeliveryRate[]> {
    const where: Prisma.DeliveryRateWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (zone_id) where.zone_id = zone_id;

    const data = await this.prisma.deliveryRate.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async findByZoneAndVehicleType(
    zone_id: string,
    vehicle_type: VehicleType
  ): Promise<DeliveryRate | null> {
    const data = await this.prisma.deliveryRate.findFirst({
      where: {
        zone_id,
        vehicle_type,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async create(data: CreateDeliveryRateData): Promise<DeliveryRate> {
    const created = await this.prisma.deliveryRate.create({
      data: {
        tenant_id: data.tenant_id,
        zone_id: data.zone_id ?? null,
        vehicle_type: data.vehicle_type,
        distance_km_min: data.distance_km_min,
        distance_km_max: data.distance_km_max,
        base_price: data.base_price,
        price_per_km: data.price_per_km,
        currency: data.currency ?? 'USD',
        priority_multiplier: data.priority_multiplier as Prisma.InputJsonValue,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateDeliveryRateData): Promise<DeliveryRate> {
    const updated = await this.prisma.deliveryRate.update({
      where: { id },
      data: {
        zone_id: data.zone_id ?? undefined,
        vehicle_type: data.vehicle_type,
        distance_km_min: data.distance_km_min,
        distance_km_max: data.distance_km_max,
        base_price: data.base_price,
        price_per_km: data.price_per_km,
        currency: data.currency,
        priority_multiplier: data.priority_multiplier ? (data.priority_multiplier as Prisma.InputJsonValue) : undefined,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryRate.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string | null;
    logistics_provider_id?: string | null;
    zone_id: string | null;
    vehicle_type: string;
    distance_km_min: Prisma.Decimal | number;
    distance_km_max: Prisma.Decimal | number;
    base_price: Prisma.Decimal | number;
    price_per_km: Prisma.Decimal | number;
    currency: string;
    priority_multiplier: Prisma.JsonValue;
    created_at: Date;
    updated_at: Date;
  }): DeliveryRate {
    // Si tenant_id es null, lanzar error ya que la entidad requiere tenant_id
    if (!data.tenant_id) {
      throw new Error('DeliveryRate must have tenant_id');
    }
    return new DeliveryRate(
      data.id,
      data.tenant_id,
      data.zone_id,
      data.vehicle_type as VehicleType,
      Number(data.distance_km_min),
      Number(data.distance_km_max),
      Number(data.base_price),
      Number(data.price_per_km),
      data.currency,
      data.priority_multiplier as Record<string, unknown>,
      data.created_at,
      data.updated_at
    );
  }
}

