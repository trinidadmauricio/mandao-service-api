/**
 * Use Case: Crear Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { Driver, WorkType, DriverStatus } from '../../domain/entities/Driver';
import { CreateDriverDto } from '../dto/CreateDriverDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class CreateDriverUseCase {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async execute(dto: CreateDriverDto, context?: CreateDriverContext): Promise<Driver> {
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

        // Validar que no intenten crear un driver con otro logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only create drivers for your own logistics provider');
        }
      }
    }

    // Si se asigna un vehicle_id, sincronizar la relación bidireccional
    const vehicleId = dto.vehicle_id ?? null;

    // Usar transacción para mantener la consistencia
    return await this.prisma.$transaction(async (tx) => {
      // Crear driver directamente en la transacción
      const createdData = await tx.driver.create({
        data: {
          logistics_provider_id: logisticsProviderId!,
          user_id: dto.user_id,
          identity_document: dto.identity_document,
          driving_license: dto.driving_license,
          date_of_birth: dto.date_of_birth,
          emergency_contact: dto.emergency_contact as Prisma.InputJsonValue,
          has_own_vehicle: dto.has_own_vehicle,
          vehicle_id: vehicleId,
          work_type: dto.work_type,
          work_zone: dto.work_zone ?? null,
          availability_status: dto.availability_status ?? 'AVAILABLE',
          documents: dto.documents as Prisma.InputJsonValue,
          delivery_zones:
            dto.delivery_zone_ids && dto.delivery_zone_ids.length > 0
              ? {
                  createMany: {
                    data: dto.delivery_zone_ids.map((delivery_zone_id) => ({
                      delivery_zone_id,
                    })),
                    skipDuplicates: true,
                  },
                }
              : undefined,
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

      // Sincronizar la relación bidireccional: actualizar driver_id en el vehículo
      if (vehicleId) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { driver_id: createdData.id },
        });
      }

      // Convertir a dominio
      const deliveryZones =
        createdData.delivery_zones?.map((dz) => ({
          id: dz.id,
          delivery_zone_id: dz.delivery_zone_id,
          created_at: dz.created_at,
          delivery_zone: dz.delivery_zone ? { id: dz.delivery_zone.id, name: dz.delivery_zone.name } : undefined,
        })) ?? [];

      const vehicle = createdData.vehicle
        ? {
            id: createdData.vehicle.id,
            logistics_provider_id: createdData.vehicle.logistics_provider_id,
            driver_id: createdData.vehicle.driver_id,
            vehicle_type: createdData.vehicle.vehicle_type as
              | 'MOTORCYCLE'
              | 'SEDAN'
              | 'MINI_VAN'
              | 'PANEL'
              | 'TRUCK'
              | 'PICKUP',
            license_plate: createdData.vehicle.license_plate,
            brand: createdData.vehicle.brand,
            model: createdData.vehicle.model,
            year: createdData.vehicle.year,
            color: createdData.vehicle.color,
            insurance_policy: createdData.vehicle.insurance_policy,
            insurance_expires_at: createdData.vehicle.insurance_expires_at,
            last_maintenance_at: createdData.vehicle.last_maintenance_at,
            status: createdData.vehicle.status as 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE',
            specifications: createdData.vehicle.specifications
              ? (createdData.vehicle.specifications as Record<string, unknown>)
              : null,
            created_at: createdData.vehicle.created_at,
            updated_at: createdData.vehicle.updated_at,
          }
        : null;

      return new Driver(
        createdData.id,
        createdData.logistics_provider_id,
        createdData.user_id,
        createdData.identity_document,
        createdData.driving_license,
        createdData.date_of_birth,
        createdData.emergency_contact as Record<string, unknown>,
        createdData.has_own_vehicle,
        createdData.vehicle_id,
        createdData.work_type as WorkType,
        createdData.work_zone,
        createdData.availability_status as DriverStatus,
        createdData.rating_avg ? Number(createdData.rating_avg) : null,
        createdData.total_deliveries,
        createdData.documents as Record<string, unknown>,
        createdData.created_at,
        createdData.updated_at,
        deliveryZones,
        vehicle
      );
    });
  }
}

