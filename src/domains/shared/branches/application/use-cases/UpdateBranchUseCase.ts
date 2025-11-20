/**
 * Use Case: Actualizar Branch
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';
import { UpdateBranchDto } from '../dto/UpdateBranchDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateBranchUseCase {
  constructor(@inject(TYPES.IBranchRepository) private repository: IBranchRepository) {}

  async execute(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('Branch not found');
    }

    // Si se marca como main, desmarcar las demás branches del tenant
    if (dto.is_main === true) {
      const existingMain = await this.repository.findMainByTenantId(existing.tenant_id);
      if (existingMain && existingMain.id !== id) {
        await this.repository.update(existingMain.id, { is_main: false });
      }
    }

    return await this.repository.update(id, dto);
  }
}

