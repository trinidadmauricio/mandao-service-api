/**
 * Use Case: Listar todos los Users
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository, UsersListResult } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { ListUsersFiltersDto } from '../dto/ListUsersFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListUsersUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(
    tenant_id?: string,
    filters?: ListUsersFiltersDto
  ): Promise<User[] | UsersListResult> {
    // Si hay filtros, usar findAllWithFilters
    if (filters && this.hasFilters(filters)) {
      return await this.repository.findAllWithFilters(tenant_id, filters);
    }

    // Si no hay filtros, mantener compatibilidad con método anterior
    if (tenant_id) {
      const users = await this.repository.findByTenantId(tenant_id);
      return users;
    }
    const users = await this.repository.findAll();
    return users;
  }

  private hasFilters(filters: ListUsersFiltersDto): boolean {
    return !!(
      filters.search ||
      filters.role ||
      filters.status ||
      filters.logistics_provider_id ||
      filters.page ||
      filters.limit
    );
  }
}
