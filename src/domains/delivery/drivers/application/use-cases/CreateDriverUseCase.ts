/**
 * Use Case: Crear Driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';
import { Driver } from '../../domain/entities/Driver';
import { CreateDriverDto } from '../dto/CreateDriverDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface CreateDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class CreateDriverUseCase {
  constructor(
    @inject(TYPES.IDriverRepository) private repository: IDriverRepository,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(dto: CreateDriverDto, context?: CreateDriverContext): Promise<Driver> {
    // Validar que el usuario existe y tiene rol DRIVER
    const user = await this.userRepository.findById(dto.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== UserRole.DRIVER) {
      throw new Error(`User must have role DRIVER. Current role: ${user.role}`);
    }

    // Validar que el usuario no esté ya asociado a otro driver
    const existingDriver = await this.repository.findByUserId(dto.user_id);
    if (existingDriver) {
      throw new Error('User is already associated with another driver');
    }

    // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, asignar automáticamente su logistics_provider_id
    let logisticsProviderId = dto.logistics_provider_id;

    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        // Validar que no intenten crear un driver con otro logistics_provider_id
        if (dto.logistics_provider_id && dto.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You can only create drivers for your own logistics provider');
        }

        // Validar que el usuario tenga el mismo logistics_provider_id
        if (user.logistics_provider_id && user.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('User logistics_provider_id does not match your logistics provider');
        }

        // Asignar automáticamente el logistics_provider_id del usuario
        logisticsProviderId = currentUserLogisticsProviderId;
      }
    }

    // Validar que el logistics_provider_id del usuario coincida con el del driver (solo si no hay contexto)
    if (!context && user.logistics_provider_id && logisticsProviderId && user.logistics_provider_id !== logisticsProviderId) {
      throw new Error('User logistics_provider_id does not match driver logistics_provider_id');
    }

    // Crear driver
    const driver = await this.repository.create({
      logistics_provider_id: logisticsProviderId!,
      user_id: dto.user_id,
      identity_document: dto.identity_document,
      driving_license: dto.driving_license,
      date_of_birth: dto.date_of_birth,
      emergency_contact: dto.emergency_contact,
      has_own_vehicle: dto.has_own_vehicle,
      vehicle_id: dto.vehicle_id,
      work_type: dto.work_type,
      work_zone: dto.work_zone,
      availability_status: dto.availability_status,
      documents: dto.documents,
    });

    return driver;
  }
}

