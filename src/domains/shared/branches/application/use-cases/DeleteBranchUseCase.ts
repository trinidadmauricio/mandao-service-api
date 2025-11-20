/**
 * Use Case: Eliminar Branch
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteBranchUseCase {
  constructor(@inject(TYPES.IBranchRepository) private repository: IBranchRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('Branch not found');
    }

    await this.repository.delete(id);
  }
}

