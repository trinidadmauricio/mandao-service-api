/**
 * Use Case: Crear User
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { CreateUserDto } from '../dto/CreateUserDto';
import { hashPassword } from '../../../../../shared/utils/password.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateUserUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
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
    });

    return user;
  }
}

