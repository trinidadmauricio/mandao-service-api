/**
 * Use Case: Eliminar Brand
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteBrandUseCase {
  constructor(@inject(TYPES.IBrandRepository) private repository: IBrandRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Brand not found');
    }

    await this.repository.delete(id);
  }
}

