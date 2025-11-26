/**
 * Use Case: Obtener Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { Vehicle } from '../../domain/entities/Vehicle';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface GetVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class GetVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(id: string, context?: GetVehicleContext): Promise<Vehicle> {
    const vehicle = await this.repository.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Validar ownership para LOGISTICS_PROVIDER y SUPERVISOR
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        // Si el vehicle no tiene logistics_provider_id, no puede ser accedido por LOGISTICS_PROVIDER/SUPERVISOR
        if (!vehicle.logistics_provider_id) {
          throw new Error('You do not have permission to access this vehicle');
        }
        if (vehicle.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to access this vehicle');
        }
      }
    }

    return vehicle;
  }
}

