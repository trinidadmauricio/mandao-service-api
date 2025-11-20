/**
 * Use Case: Crear Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { CreateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(dto: CreateVehicleDto): Promise<Vehicle> {
    // Crear vehicle
    const vehicle = await this.repository.create({
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

    return vehicle;
  }
}

