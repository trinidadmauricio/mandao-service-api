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
    const newVehicleId = dto.vehicle_id ?? null;

    // Usar transacción para mantener la consistencia
    return await this.prisma.$transaction(async (tx) => {
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
          vehicle_id: dto.vehicle_id ?? undefined,
          work_type: dto.work_type,
          work_zone: dto.work_zone ?? undefined,
          availability_status: dto.availability_status,
          documents: dto.documents ? (dto.documents as any) : undefined,
        },
      });

      // Sincronizar la relación bidireccional
      if (oldVehicleId !== newVehicleId) {
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
        updatedData.updated_at
      );
    });
  }
}

