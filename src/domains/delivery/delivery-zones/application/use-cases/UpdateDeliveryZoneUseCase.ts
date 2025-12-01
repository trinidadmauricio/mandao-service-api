/**
 * Use Case: Actualizar DeliveryZone
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeliveryZoneRepository } from '../../domain/repositories/IDeliveryZoneRepository';
import { DeliveryZone } from '../../domain/entities/DeliveryZone';
import { UpdateDeliveryZoneDto } from '../dto/CreateDeliveryZoneDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface UpdateDeliveryZoneContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
  currentUserTenantId: string | null;
}

@injectable()
export class UpdateDeliveryZoneUseCase {
  constructor(@inject(TYPES.IDeliveryZoneRepository) private repository: IDeliveryZoneRepository) {}

  async execute(
    id: string,
    dto: UpdateDeliveryZoneDto,
    context?: UpdateDeliveryZoneContext
  ): Promise<DeliveryZone> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Delivery zone not found');
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
          throw new Error('You can only update zones from your own logistics provider');
        }
      }
      // Si el usuario es SAAS_ADMIN, SAAS_EDITOR o OWNER
      else if (
        currentRole === UserRole.SAAS_ADMIN ||
        currentRole === UserRole.SAAS_EDITOR ||
        currentRole === UserRole.OWNER
      ) {
        // Si la zona tiene tenant_id, debe pertenecer a su tenant
        if (existing.tenant_id && existing.tenant_id !== currentUserTenantId) {
          // SAAS_ADMIN y SAAS_EDITOR pueden actualizar cualquier zona
          if (currentRole !== UserRole.SAAS_ADMIN && currentRole !== UserRole.SAAS_EDITOR) {
            throw new Error('You can only update zones from your own tenant');
          }
        }
      }
    }

    return await this.repository.update(id, {
      name: dto.name,
      boundary: dto.boundary,
      base_rate: dto.base_rate,
      rate_per_km: dto.rate_per_km,
      surge_multiplier: dto.surge_multiplier,
      currency: dto.currency,
      is_active: dto.is_active,
    });
  }
}
