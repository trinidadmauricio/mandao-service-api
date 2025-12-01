/**
 * Use Case: Crear DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { CreateDeliveryZoneDto } from '../dto/CreateDeliveryZoneDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateDeliveryZoneContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
  currentUserTenantId: string | null;
}

@injectable()
export class CreateDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(dto: CreateDeliveryZoneDto, context?: CreateDeliveryZoneContext): Promise<DeliveryZone> {
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
          throw new Error('LOGISTICS_PROVIDER and SUPERVISOR cannot create zones with tenant_id');
        }

        // Validar que no intenten crear con otro logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only create zones for your own logistics provider');
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
          throw new Error('SAAS_ADMIN, SAAS_EDITOR and OWNER cannot create zones with logistics_provider_id');
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

    const zone = await this.repository.create({
      tenant_id: tenantId,
      logistics_provider_id: logisticsProviderId,
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: dto.surge_multiplier,
      currency: dto.currency,
      is_active: dto.is_active,
    });

    return zone;
  }
}
