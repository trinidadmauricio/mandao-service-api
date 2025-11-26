/**
 * Use Case: Actualizar Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { UpdateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface UpdateVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class UpdateVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

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

    // Actualizar
    return await this.repository.update(id, {
      logistics_provider_id: dto.logistics_provider_id,
      driver_id: dto.driver_id,
      vehicle_type: dto.vehicle_type,
      license_plate: dto.license_plate,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      insurance_policy: dto.insurance_policy,
      insurance_expires_at: dto.insurance_expires_at,
      last_maintenance_at: dto.last_maintenance_at,
      status: dto.status,
      specifications: dto.specifications,
    });
  }
}

