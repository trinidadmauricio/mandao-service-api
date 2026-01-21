/**
 * Use Case: Actualizar Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver, WorkType, DriverStatus } from '../../domain/entities/Driver';
import { UpdateDriverDto } from '../dto/CreateDriverDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface UpdateDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class UpdateDriverUseCase {
  constructor(
    @inject(TYPES.IDriverRepository) private repository: IDriverRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(id: string, dto: UpdateDriverDto, context?: UpdateDriverContext): Promise<Driver> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Driver not found');
    }

    // Validar ownership para LOGISTICS_PROVIDER y SUPERVISOR
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        if (existing.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to update this driver');
        }
      }
    }

    // Si se está cambiando el vehicle_id, sincronizar la relación bidireccional
    const oldVehicleId = existing.vehicle_id;
    const vehicleIdProvided = dto.vehicle_id !== undefined;
    const newVehicleId = vehicleIdProvided ? dto.vehicle_id ?? null : oldVehicleId;

    // Usar transacción para mantener la consistencia
    return await this.prisma.$transaction(async (tx) => {
      const deliveryZonesUpdate =
        dto.delivery_zone_ids !== undefined
          ? {
              deleteMany: {},
              ...(dto.delivery_zone_ids.length > 0
                ? {
                    createMany: {
                      data: dto.delivery_zone_ids.map((delivery_zone_id) => ({
                        delivery_zone_id,
                      })),
                      skipDuplicates: true,
                    },
                  }
                : {}),
            }
          : undefined;

      // Actualizar el driver directamente en la transacción
      const updatedData = await tx.driver.update({
        where: { id },
        data: {
          identity_document: dto.identity_document,
          driving_license: dto.driving_license,
          date_of_birth: dto.date_of_birth,
          emergency_contact: dto.emergency_contact
            ? (dto.emergency_contact as any)
            : undefined,
          has_own_vehicle: dto.has_own_vehicle,
          // Permitir explicitamente limpiar el vehículo enviando null.
          // Si no viene vehicle_id, no tocar el campo.
          vehicle_id: vehicleIdProvided ? dto.vehicle_id : undefined,
          work_type: dto.work_type,
          work_zone: dto.work_zone ?? undefined,
          delivery_zones: deliveryZonesUpdate,
          availability_status: dto.availability_status,
          documents: dto.documents ? (dto.documents as any) : undefined,
        },
        include: {
          delivery_zones: {
            include: {
              delivery_zone: {
                select: { id: true, name: true },
              },
            },
          },
          vehicle: true,
        },
      });

      // Sincronizar la relación bidireccional
      // Solo sincronizar si el request incluyó vehicle_id (string o null).
      if (vehicleIdProvided && oldVehicleId !== newVehicleId) {
        // Limpiar driver_id del vehículo anterior si existía
        if (oldVehicleId) {
          await tx.vehicle.update({
            where: { id: oldVehicleId },
            data: { driver_id: null },
          });
        }

        // Establecer driver_id en el nuevo vehículo si se asignó uno
        if (newVehicleId) {
          await tx.vehicle.update({
            where: { id: newVehicleId },
            data: { driver_id: id },
          });
        }
      }

      // Convertir a dominio
      const deliveryZones =
        updatedData.delivery_zones?.map((dz) => ({
          id: dz.id,
          delivery_zone_id: dz.delivery_zone_id,
          created_at: dz.created_at,
          delivery_zone: dz.delivery_zone ? { id: dz.delivery_zone.id, name: dz.delivery_zone.name } : undefined,
        })) ?? [];

      const vehicle = updatedData.vehicle
        ? {
            id: updatedData.vehicle.id,
            logistics_provider_id: updatedData.vehicle.logistics_provider_id,
            driver_id: updatedData.vehicle.driver_id,
            vehicle_type: updatedData.vehicle.vehicle_type as
              | 'MOTORCYCLE'
              | 'SEDAN'
              | 'MINI_VAN'
              | 'PANEL'
              | 'TRUCK'
              | 'PICKUP',
            license_plate: updatedData.vehicle.license_plate,
            brand: updatedData.vehicle.brand,
            model: updatedData.vehicle.model,
            year: updatedData.vehicle.year,
            color: updatedData.vehicle.color,
            insurance_policy: updatedData.vehicle.insurance_policy,
            insurance_expires_at: updatedData.vehicle.insurance_expires_at,
            last_maintenance_at: updatedData.vehicle.last_maintenance_at,
            status: updatedData.vehicle.status as 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE',
            specifications: updatedData.vehicle.specifications
              ? (updatedData.vehicle.specifications as Record<string, unknown>)
              : null,
            created_at: updatedData.vehicle.created_at,
            updated_at: updatedData.vehicle.updated_at,
          }
        : null;

      return new Driver(
        updatedData.id,
        updatedData.logistics_provider_id,
        updatedData.user_id,
        updatedData.identity_document,
        updatedData.driving_license,
        updatedData.date_of_birth,
        updatedData.emergency_contact as Record<string, unknown>,
        updatedData.has_own_vehicle,
        updatedData.vehicle_id,
        updatedData.work_type as WorkType,
        updatedData.work_zone,
        updatedData.availability_status as DriverStatus,
        updatedData.rating_avg ? Number(updatedData.rating_avg) : null,
        updatedData.total_deliveries,
        updatedData.documents as Record<string, unknown>,
        updatedData.created_at,
        updatedData.updated_at,
        deliveryZones,
        vehicle
      );
    });
  }
}

