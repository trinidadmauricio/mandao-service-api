/**
 * Use Case: Crear Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { CreateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class CreateVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

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

    // Crear vehicle
    const vehicle = await this.repository.create({
      logistics_provider_id: logisticsProviderId,
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

    return vehicle;
  }
}

