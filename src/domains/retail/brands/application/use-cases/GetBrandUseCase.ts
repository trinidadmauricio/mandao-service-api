/**
 * Use Case: Obtener Brand
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetBrandUseCase {
  constructor(@inject(TYPES.IBrandRepository) private repository: IBrandRepository) {}

  async execute(id: string): Promise<Brand> {
    const brand = await this.repository.findById(id);
    if (!brand) {
      throw new Error('Brand not found');
    }
    return brand;
  }
}

