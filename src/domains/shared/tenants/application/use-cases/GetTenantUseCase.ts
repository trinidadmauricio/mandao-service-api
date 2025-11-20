/**
 * Use Case: Obtener Tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetTenantUseCase {
  constructor(@inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    return tenant;
  }
}
