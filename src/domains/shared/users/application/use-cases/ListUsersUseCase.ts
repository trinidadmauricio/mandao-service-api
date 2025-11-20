/**
 * Use Case: Listar todos los Users
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListUsersUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(tenant_id?: string): Promise<User[]> {
    if (tenant_id) {
      return await this.repository.findByTenantId(tenant_id);
    }
    return await this.repository.findAll();
  }
}

