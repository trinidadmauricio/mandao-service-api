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
        createdData.updated_at
      );
    });
  }
}

