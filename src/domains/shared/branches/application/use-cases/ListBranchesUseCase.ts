/**
 * Use Case: Listar Branches
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListBranchesUseCase {
  constructor(@inject(TYPES.IBranchRepository) private repository: IBranchRepository) {}

  async execute(tenant_id?: string): Promise<Branch[]> {
    if (tenant_id) {
      return await this.repository.findByTenantId(tenant_id);
    }
    return await this.repository.findAll();
  }
}

