/**
 * Use Case: Crear Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { CreateDriverDto } from '../dto/CreateDriverDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateDriverUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(dto: CreateDriverDto): Promise<Driver> {
    // Crear driver
    const driver = await this.repository.create({
      logistics_provider_id: dto.logistics_provider_id,
      user_id: dto.user_id,
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

    return driver;
  }
}

