/**
 * Use Case: Obtener Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetDriverUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(id: string): Promise<Driver> {
    const driver = await this.repository.findById(id);
    if (!driver) {
      throw new Error('Driver not found');
    }
    return driver;
  }
}

