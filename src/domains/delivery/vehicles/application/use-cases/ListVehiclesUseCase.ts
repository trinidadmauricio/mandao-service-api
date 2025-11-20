/**
 * Use Case: Listar Vehicles
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListVehiclesUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(logistics_provider_id?: string): Promise<Vehicle[]> {
    return await this.repository.findAll(logistics_provider_id);
  }
}

