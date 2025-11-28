/**
 * Use Case: Crear Tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../domain/repositories/ITenantRepository';
import { IOrderCounterRepository } from '../../../order-counters/domain/repositories/IOrderCounterRepository';
import { Tenant } from '../../domain/entities/Tenant';
import { CreateTenantDto } from '../dto/CreateTenantDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateTenantUseCase {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.IOrderCounterRepository) private orderCounterRepository: IOrderCounterRepository
  ) {}

  async execute(dto: CreateTenantDto): Promise<Tenant> {
    // Validar que el slug no exista
    const existing = await this.tenantRepository.findBySlug(dto.slug);
    if (existing) {
      throw new Error('Tenant with this slug already exists');
    }

    // Crear tenant
    const tenant = await this.tenantRepository.create({
      slug: dto.slug,
      name: dto.name,
      type: dto.type,
      subscription_plan_id: dto.subscription_plan_id,
      default_locale: dto.default_locale,
      default_currency: dto.default_currency,
      settings: dto.settings,
    });

    // Crear OrderCounter automáticamente para el nuevo tenant
    await this.orderCounterRepository.create({
      tenant_id: tenant.id,
      prefix: null,
      padding_length: 6,
    });

    return tenant;
  }
}
