/**
 * Use Case: Crear DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { CreateDeliveryRateDto } from '../dto/CreateDeliveryRateDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateDeliveryRateContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
  currentUserTenantId: string | null;
}

@injectable()
export class CreateDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(dto: CreateDeliveryRateDto, context?: CreateDeliveryRateContext): Promise<DeliveryRate> {
    if (dto.distance_km_min >= dto.distance_km_max) {
      throw new Error('distance_km_min must be less than distance_km_max');
    }

    let tenantId: string | null = null;
    let logisticsProviderId: string | null = null;

    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;
      const currentUserTenantId = context.currentUserTenantId;

      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, usar logistics_provider_id
      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        logisticsProviderId = currentUserLogisticsProviderId;
        tenantId = null;

        // Validar que no intenten crear con tenant_id
        if (dto.tenant_id) {
          throw new Error('LOGISTICS_PROVIDER and SUPERVISOR cannot create rates with tenant_id');
        }

        // Validar que no intenten crear con otro logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only create rates for your own logistics provider');
        }
      }
      // Si el usuario es SAAS_ADMIN, SAAS_EDITOR o OWNER, usar tenant_id
      else if (
        (currentRole === UserRole.SAAS_ADMIN ||
          currentRole === UserRole.SAAS_EDITOR ||
          currentRole === UserRole.OWNER) &&
        currentUserTenantId
      ) {
        tenantId = dto.tenant_id || currentUserTenantId;
        logisticsProviderId = null;

        // Validar que no intenten crear con logistics_provider_id
        if (dto.logistics_provider_id) {
          throw new Error('SAAS_ADMIN, SAAS_EDITOR and OWNER cannot create rates with logistics_provider_id');
        }
      }
    } else {
      // Si no hay context, usar los valores del DTO directamente
      tenantId = dto.tenant_id || null;
      logisticsProviderId = dto.logistics_provider_id || null;
    }

    // Validar que al menos uno esté presente
    if (!tenantId && !logisticsProviderId) {
      throw new Error('Either tenant_id or logistics_provider_id must be provided');
    }

    const rate = await this.repository.create({
      tenant_id: tenantId,
      logistics_provider_id: logisticsProviderId,
      zone_id: dto.zone_id,
      vehicle_type: dto.vehicle_type,
      distance_km_min: dto.distance_km_min,
      distance_km_max: dto.distance_km_max,
      base_price: dto.base_price,
      price_per_km: dto.price_per_km,
      currency: dto.currency,
      priority_multiplier: dto.priority_multiplier,
    });

    return rate;
  }
}
