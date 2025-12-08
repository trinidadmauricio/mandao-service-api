/**
 * Use Case: Crear Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { Vehicle, VehicleType, VehicleStatus } from '../../domain/entities/Vehicle';
import { CreateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class CreateVehicleUseCase {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async execute(dto: CreateVehicleDto, context?: CreateVehicleContext): Promise<Vehicle> {
    // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, asignar automáticamente su logistics_provider_id
    let logisticsProviderId = dto.logistics_provider_id;

    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        // Asignar automáticamente el logistics_provider_id del usuario
        logisticsProviderId = currentUserLogisticsProviderId;

        // Validar que no intenten crear un vehicle con otro logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only create vehicles for your own logistics provider');
        }
      }
    }

    // Si se asigna un driver_id, sincronizar la relación bidireccional
    const driverId = dto.driver_id ?? null;

    // Usar transacción para mantener la consistencia
    return await this.prisma.$transaction(async (tx) => {
      // Crear vehicle directamente en la transacción
      const createdData = await tx.vehicle.create({
        data: {
          logistics_provider_id: logisticsProviderId ?? null,
          driver_id: driverId,
          vehicle_type: dto.vehicle_type,
          license_plate: dto.license_plate,
          brand: dto.brand,
          model: dto.model,
          year: dto.year,
          color: dto.color,
          insurance_policy: dto.insurance_policy,
          insurance_expires_at: dto.insurance_expires_at,
          last_maintenance_at: dto.last_maintenance_at ?? null,
          status: dto.status ?? 'AVAILABLE',
          specifications: dto.specifications ? (dto.specifications as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      // Sincronizar la relación bidireccional: actualizar vehicle_id en el driver
      if (driverId) {
        await tx.driver.update({
          where: { id: driverId },
          data: { vehicle_id: createdData.id },
        });
      }

      // Convertir a dominio
      return new Vehicle(
        createdData.id,
        createdData.logistics_provider_id,
        createdData.driver_id,
        createdData.vehicle_type as VehicleType,
        createdData.license_plate,
        createdData.brand,
        createdData.model,
        createdData.year,
        createdData.color,
        createdData.insurance_policy,
        createdData.insurance_expires_at,
        createdData.last_maintenance_at,
        createdData.status as VehicleStatus,
        createdData.specifications ? (createdData.specifications as Record<string, unknown>) : null,
        createdData.created_at,
        createdData.updated_at
      );
    });
  }
}

