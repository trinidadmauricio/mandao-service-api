/**
 * Implementación de Vehicle Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IVehicleRepository,
  CreateVehicleData,
  UpdateVehicleData,
} from '../../domain/repositories/IVehicleRepository';
import { Vehicle, VehicleType, VehicleStatus } from '../../domain/entities/Vehicle';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Vehicle | null> {
    const data = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(logistics_provider_id?: string): Promise<Vehicle[]> {
    const where = logistics_provider_id ? { logistics_provider_id } : {};
    const data = await this.prisma.vehicle.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateVehicleData): Promise<Vehicle> {
    const created = await this.prisma.vehicle.create({
      data: {
        logistics_provider_id: data.logistics_provider_id ?? null,
        driver_id: data.driver_id ?? null,
        vehicle_type: data.vehicle_type,
        license_plate: data.license_plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        insurance_policy: data.insurance_policy,
        insurance_expires_at: data.insurance_expires_at,
        last_maintenance_at: data.last_maintenance_at ?? null,
        status: data.status ?? 'AVAILABLE',
        specifications: data.specifications ? (data.specifications as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        logistics_provider_id: data.logistics_provider_id ?? undefined,
        driver_id: data.driver_id ?? undefined,
        vehicle_type: data.vehicle_type,
        license_plate: data.license_plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        insurance_policy: data.insurance_policy,
        insurance_expires_at: data.insurance_expires_at,
        last_maintenance_at: data.last_maintenance_at ?? undefined,
        status: data.status,
        specifications: data.specifications ? (data.specifications as Prisma.InputJsonValue) : undefined,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vehicle.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    logistics_provider_id: string | null;
    driver_id: string | null;
    vehicle_type: string;
    license_plate: string;
    brand: string;
    model: string;
    year: number;
    color: string;
    insurance_policy: string;
    insurance_expires_at: Date;
    last_maintenance_at: Date | null;
    status: string;
    specifications: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  }): Vehicle {
    return new Vehicle(
      data.id,
      data.logistics_provider_id,
      data.driver_id,
      data.vehicle_type as VehicleType,
      data.license_plate,
      data.brand,
      data.model,
      data.year,
      data.color,
      data.insurance_policy,
      data.insurance_expires_at,
      data.last_maintenance_at,
      data.status as VehicleStatus,
      data.specifications ? (data.specifications as Record<string, unknown>) : null,
      data.created_at,
      data.updated_at
    );
  }
}

