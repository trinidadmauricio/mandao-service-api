/**
 * Use Case: Obtener Branch por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetBranchUseCase {
  constructor(@inject(TYPES.IBranchRepository) private repository: IBranchRepository) {}

  async execute(id: string): Promise<Branch> {
    const branch = await this.repository.findById(id);

    if (!branch) {
      throw new Error('Branch not found');
    }

    return branch;
  }
}

