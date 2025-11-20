/**
 * Use Case: Eliminar Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteDriverUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Driver not found');
    }

    // Eliminar
    await this.repository.delete(id);
  }
}

