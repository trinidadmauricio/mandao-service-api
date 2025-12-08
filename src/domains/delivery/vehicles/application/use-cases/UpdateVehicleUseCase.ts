/**
 * Use Case: Actualizar Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle, VehicleType, VehicleStatus } from '../../domain/entities/Vehicle';
import { UpdateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface UpdateVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class UpdateVehicleUseCase {
  constructor(
    @inject(TYPES.IVehicleRepository) private repository: IVehicleRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(id: string, dto: UpdateVehicleDto, context?: UpdateVehicleContext): Promise<Vehicle> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Vehicle not found');
    }

    // Validar ownership para LOGISTICS_PROVIDER y SUPERVISOR
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        // Si el vehicle no tiene logistics_provider_id, no puede ser actualizado por LOGISTICS_PROVIDER/SUPERVISOR
        if (!existing.logistics_provider_id) {
          throw new Error('You do not have permission to update this vehicle');
        }
        if (existing.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to update this vehicle');
        }

        // Validar que no intenten cambiar el logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You cannot change the logistics provider of a vehicle');
        }
      }
    }

    // Si se está cambiando el driver_id, sincronizar la relación bidireccional
    const oldDriverId = existing.driver_id;
    const newDriverId = dto.driver_id ?? null;

    // Usar transacción para mantener la consistencia
    return await this.prisma.$transaction(async (tx) => {
      // Actualizar el vehicle directamente en la transacción
      const updatedData = await tx.vehicle.update({
        where: { id },
        data: {
          logistics_provider_id: dto.logistics_provider_id ?? undefined,
          driver_id: dto.driver_id ?? undefined,
          vehicle_type: dto.vehicle_type,
          license_plate: dto.license_plate,
          brand: dto.brand,
          model: dto.model,
          year: dto.year,
          color: dto.color,
          insurance_policy: dto.insurance_policy,
          insurance_expires_at: dto.insurance_expires_at,
          last_maintenance_at: dto.last_maintenance_at ?? undefined,
          status: dto.status,
          specifications: dto.specifications ? (dto.specifications as Prisma.InputJsonValue) : undefined,
        },
      });

      // Sincronizar la relación bidireccional
      if (oldDriverId !== newDriverId) {
        // Limpiar vehicle_id del driver anterior si existía
        if (oldDriverId) {
          await tx.driver.update({
            where: { id: oldDriverId },
            data: { vehicle_id: null },
          });
        }

        // Establecer vehicle_id en el nuevo driver si se asignó uno
        if (newDriverId) {
          await tx.driver.update({
            where: { id: newDriverId },
            data: { vehicle_id: id },
          });
        }
      }

      // Convertir a dominio
      return new Vehicle(
        updatedData.id,
        updatedData.logistics_provider_id,
        updatedData.driver_id,
        updatedData.vehicle_type as VehicleType,
        updatedData.license_plate,
        updatedData.brand,
        updatedData.model,
        updatedData.year,
        updatedData.color,
        updatedData.insurance_policy,
        updatedData.insurance_expires_at,
        updatedData.last_maintenance_at,
        updatedData.status as VehicleStatus,
        updatedData.specifications ? (updatedData.specifications as Record<string, unknown>) : null,
        updatedData.created_at,
        updatedData.updated_at
      );
    });
  }
}

