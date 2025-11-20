/**
 * Use Case: Listar Drivers
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListDriversUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(logistics_provider_id?: string): Promise<Driver[]> {
    return await this.repository.findAll(logistics_provider_id);
  }
}

