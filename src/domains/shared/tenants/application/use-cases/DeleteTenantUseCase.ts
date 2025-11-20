/**
 * Use Case: Eliminar Tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteTenantUseCase {
  constructor(@inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que el tenant existe
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new Error('Tenant not found');
    }

    // Eliminar tenant
    await this.tenantRepository.delete(id);
  }
}
