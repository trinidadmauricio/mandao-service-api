/**
 * Use Case: Listar Brands
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBrandRepository } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListBrandsUseCase {
  constructor(@inject(TYPES.IBrandRepository) private repository: IBrandRepository) {}

  async execute(tenant_id?: string): Promise<Brand[]> {
    return await this.repository.findAll(tenant_id);
  }
}

