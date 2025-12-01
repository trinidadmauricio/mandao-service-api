/**
 * Use Case: Eliminar Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface DeleteDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class DeleteDriverUseCase {
  constructor(
    @inject(TYPES.IDriverRepository) private repository: IDriverRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

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

    // Obtener user_id antes de eliminar el driver
    const userId = existing.user_id;

    // Eliminar driver
    await this.repository.delete(id);

    // Eliminar usuario asociado en cascada
    try {
      await this.userRepository.delete(userId);
    } catch (error) {
      // Si el usuario no existe o ya fue eliminado, no es un error crítico
      // pero registramos el error para debugging
      if (error instanceof Error && error.message !== 'User not found') {
        throw error;
      }
    }
  }
}

