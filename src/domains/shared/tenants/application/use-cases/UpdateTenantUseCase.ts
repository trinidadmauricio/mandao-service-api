/**
 * Use Case: Actualizar Tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';
import { UpdateTenantDto } from '../dto/UpdateTenantDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateTenantUseCase {
  constructor(@inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository) {}

  async execute(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    // Verificar que el tenant existe
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new Error('Tenant not found');
    }

    // Actualizar tenant
    return this.tenantRepository.update(id, {
      name: dto.name,
      subscription_plan_id: dto.subscription_plan_id,
      subscription_status: dto.subscription_status,
      subscription_expires_at: dto.subscription_expires_at,
      default_locale: dto.default_locale,
      default_currency: dto.default_currency,
      settings: dto.settings,
    });
  }
}
