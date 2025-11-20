/**
 * Use Case: Crear Branch
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';
import { CreateBranchDto } from '../dto/CreateBranchDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateBranchUseCase {
  constructor(@inject(TYPES.IBranchRepository) private repository: IBranchRepository) {}

  async execute(dto: CreateBranchDto): Promise<Branch> {
    // Si se marca como main, desmarcar las demás branches del tenant
    if (dto.is_main) {
      const existingMain = await this.repository.findMainByTenantId(dto.tenant_id);
      if (existingMain) {
        await this.repository.update(existingMain.id, { is_main: false });
      }
    }

    return await this.repository.create(dto);
  }
}

