/**
 * Use Case: Listar Drivers
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { TYPES } from '../../../../../config/types';

import { DriverStatus } from '../../domain/entities/Driver';

@injectable()
export class ListDriversUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(logistics_provider_id?: string, availability_status?: DriverStatus): Promise<Driver[]> {
    return await this.repository.findAll(logistics_provider_id, availability_status);
  }
}

