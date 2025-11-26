/**
 * Use Case: Eliminar Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface DeleteDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class DeleteDriverUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(id: string, context?: DeleteDriverContext): Promise<void> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Driver not found');
    }

    // Validar ownership para LOGISTICS_PROVIDER y SUPERVISOR
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        if (existing.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to delete this driver');
        }
      }
    }

    // Eliminar
    await this.repository.delete(id);
  }
}

