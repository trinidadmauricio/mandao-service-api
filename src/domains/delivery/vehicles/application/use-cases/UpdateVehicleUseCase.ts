/**
 * Use Case: Actualizar Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { UpdateVehicleDto } from '../dto/CreateVehicleDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Vehicle not found');
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

