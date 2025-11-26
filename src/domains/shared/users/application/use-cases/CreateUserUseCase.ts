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
    // Validar que hay contexto (usuario autenticado)
    if (!context) {
      throw new Error('User creation requires authentication context');
    }

    const currentRole = context.currentUserRole as UserRole;

    const dtoRole = dto.role as UserRole;

    // Validación CRÍTICA: NINGÚN rol del backoffice puede crear CUSTOMER
    if (dtoRole === UserRole.CUSTOMER) {
      throw new Error('CUSTOMER role cannot be created from backoffice. CUSTOMER users are created exclusively through storefront signup.');
    }

    // Validar restricciones según el rol del usuario actual
    switch (currentRole) {
      case UserRole.SAAS_ADMIN:
        // SAAS_ADMIN puede crear todos excepto CUSTOMER (ya validado arriba)
        break;

      case UserRole.SAAS_EDITOR:
        // SAAS_EDITOR puede crear todos excepto SAAS roles y CUSTOMER
        if (dtoRole === UserRole.SAAS_ADMIN || dtoRole === UserRole.SAAS_EDITOR) {
          throw new Error('SAAS_EDITOR cannot create SAAS_ADMIN or SAAS_EDITOR users');
        }
        break;

      case UserRole.OWNER:
        // OWNER solo puede crear MERCHANT_USER
        if (dtoRole !== UserRole.MERCHANT_USER) {
          throw new Error('OWNER can only create users with role MERCHANT_USER');
        }
        break;

      case UserRole.LOGISTICS_PROVIDER:
        // LOGISTICS_PROVIDER solo puede crear SUPERVISOR
        if (dtoRole !== UserRole.SUPERVISOR) {
          throw new Error('LOGISTICS_PROVIDER can only create users with role SUPERVISOR');
        }
        // Validar que tiene logistics_provider_id
        if (!context.currentUserLogisticsProviderId) {
          throw new Error('LOGISTICS_PROVIDER user must have logistics_provider_id to create SUPERVISOR');
        }
        // Asignar automáticamente el logistics_provider_id del creador
        dto.logistics_provider_id = context.currentUserLogisticsProviderId;
        break;

      case UserRole.SUPERVISOR:
      case UserRole.MERCHANT_USER:
        // SUPERVISOR y MERCHANT_USER no pueden crear usuarios
        throw new Error(`${currentRole} role cannot create users`);
        break;

      default:
        throw new Error(`User creation not allowed for role ${currentRole}`);
    }

    // Validar que SUPERVISOR tenga logistics_provider_id (validación final)
    if (dtoRole === UserRole.SUPERVISOR && !dto.logistics_provider_id) {
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

