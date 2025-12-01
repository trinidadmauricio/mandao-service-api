/**
 * Use Case: Actualizar DeliveryRate
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryRateRepository } from '../../domain/repositories/IDeliveryRateRepository';
import { DeliveryRate } from '../../domain/entities/DeliveryRate';
import { UpdateDeliveryRateDto } from '../dto/CreateDeliveryRateDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface UpdateDeliveryRateContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
  currentUserTenantId: string | null;
}

@injectable()
export class UpdateDeliveryRateUseCase {
  constructor(@inject(TYPES.IDeliveryRateRepository) private repository: IDeliveryRateRepository) {}

  async execute(
    id: string,
    dto: UpdateDeliveryRateDto,
    context?: UpdateDeliveryRateContext
  ): Promise<DeliveryRate> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery rate not found');
    }

    if (dto.distance_km_min !== undefined && dto.distance_km_max !== undefined) {
      if (dto.distance_km_min >= dto.distance_km_max) {
        throw new Error('distance_km_min must be less than distance_km_max');
      }
    }

    // Validar permisos según el rol del usuario
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;
      const currentUserTenantId = context.currentUserTenantId;

      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR
      if (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) {
        // Debe pertenecer a su logistics_provider_id
        if (existing.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only update rates from your own logistics provider');
        }

        // No puede cambiar a tenant_id
        if (dto.tenant_id !== undefined) {
          throw new Error('LOGISTICS_PROVIDER and SUPERVISOR cannot change rate to tenant_id');
        }

        // No puede cambiar el logistics_provider_id
        if (dto.logistics_provider_id !== undefined) {
          throw new Error('You cannot change the logistics_provider_id of a rate');
        }
      }
      // Si el usuario es SAAS_ADMIN, SAAS_EDITOR o OWNER
      else if (
        currentRole === UserRole.SAAS_ADMIN ||
        currentRole === UserRole.SAAS_EDITOR ||
        currentRole === UserRole.OWNER
      ) {
        // Si la tarifa tiene tenant_id, debe pertenecer a su tenant
        if (existing.tenant_id && existing.tenant_id !== currentUserTenantId) {
          // SAAS_ADMIN y SAAS_EDITOR pueden actualizar cualquier tarifa
          if (currentRole !== UserRole.SAAS_ADMIN && currentRole !== UserRole.SAAS_EDITOR) {
            throw new Error('You can only update rates from your own tenant');
          }
        }

        // No puede cambiar a logistics_provider_id
        if (dto.logistics_provider_id !== undefined) {
          throw new Error('SAAS_ADMIN, SAAS_EDITOR and OWNER cannot change rate to logistics_provider_id');
        }
      }
    }

    return await this.repository.update(id, {
      zone_id: dto.zone_id,
      vehicle_type: dto.vehicle_type,
      distance_km_min: dto.distance_km_min,
      distance_km_max: dto.distance_km_max,
      base_price: dto.base_price,
      price_per_km: dto.price_per_km,
      currency: dto.currency,
      priority_multiplier: dto.priority_multiplier,
    });
  }
}
