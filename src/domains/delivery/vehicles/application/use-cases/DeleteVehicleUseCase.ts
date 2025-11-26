/**
 * Use Case: Eliminar Vehicle
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IVehicleRepository } from '../../domain/repositories/IVehicleRepository';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface DeleteVehicleContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class DeleteVehicleUseCase {
  constructor(@inject(TYPES.IVehicleRepository) private repository: IVehicleRepository) {}

  async execute(id: string, context?: DeleteVehicleContext): Promise<void> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
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
        // Si el vehicle no tiene logistics_provider_id, no puede ser eliminado por LOGISTICS_PROVIDER/SUPERVISOR
        if (!existing.logistics_provider_id) {
          throw new Error('You do not have permission to delete this vehicle');
        }
        if (existing.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to delete this vehicle');
        }
      }
    }

    // Eliminar
    await this.repository.delete(id);
  }
}

