/**
 * Use Case: Crear User
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { CreateUserDto } from '../dto/CreateUserDto';
import { hashPassword } from '../../../../../shared/utils/password.util';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

interface CreateUserContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class CreateUserUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(dto: CreateUserDto, context?: CreateUserContext): Promise<User> {
    // Validación CRÍTICA: Solo LOGISTICS_PROVIDER puede crear SUPERVISOR
    if (dto.role === 'SUPERVISOR') {
      if (!context || context.currentUserRole !== UserRole.LOGISTICS_PROVIDER) {
        throw new Error('Only LOGISTICS_PROVIDER can create users with role SUPERVISOR');
      }

      if (!context.currentUserLogisticsProviderId) {
        throw new Error('LOGISTICS_PROVIDER user must have logistics_provider_id to create SUPERVISOR');
      }

      // Asignar automáticamente el logistics_provider_id del creador
      dto.logistics_provider_id = context.currentUserLogisticsProviderId;
    }

    // Validar que SUPERVISOR tenga logistics_provider_id
    if (dto.role === 'SUPERVISOR' && !dto.logistics_provider_id) {
      throw new Error('SUPERVISOR role requires logistics_provider_id');
    }

    // Validar que el email no exista
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Hashear contraseña
    const password_hash = await hashPassword(dto.password);

    // Crear usuario
    const user = await this.repository.create({
      tenant_id: dto.tenant_id,
      email: dto.email,
      password_hash,
      role: dto.role,
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
      status: dto.status,
      logistics_provider_id: dto.logistics_provider_id || null,
    });

    return user;
  }
}

