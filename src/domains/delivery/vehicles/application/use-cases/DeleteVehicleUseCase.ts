/**
 * Use Case: Eliminar Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Vehicle not found');
    }

    // Eliminar
    await this.repository.delete(id);
  }
}

