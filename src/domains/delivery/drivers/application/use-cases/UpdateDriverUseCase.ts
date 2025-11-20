/**
 * Use Case: Actualizar Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { UpdateDriverDto } from '../dto/CreateDriverDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateDriverUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(id: string, dto: UpdateDriverDto): Promise<Driver> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Driver not found');
    }

    // Actualizar
    return await this.repository.update(id, {
      identity_document: dto.identity_document,
      driving_license: dto.driving_license,
      date_of_birth: dto.date_of_birth,
      emergency_contact: dto.emergency_contact,
      has_own_vehicle: dto.has_own_vehicle,
      vehicle_id: dto.vehicle_id,
      work_type: dto.work_type,
      work_zone: dto.work_zone,
      availability_status: dto.availability_status,
      documents: dto.documents,
    });
  }
}

