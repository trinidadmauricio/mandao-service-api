/**
 * Use Case: Listar Tenants
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListTenantsUseCase {
  constructor(@inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository) {}

  async execute(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }
}
