/**
 * Use Case: Actualizar User
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UpdateUserDto } from '../dto/UpdateUserDto';
import { hashPassword } from '../../../../../shared/utils/password.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateUserUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('User not found');
    }

    // Si se actualiza la contraseña, hashearla
    const updateData: Parameters<IUserRepository['update']>[1] = {
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
    };

    if (dto.password) {
      updateData.password_hash = await hashPassword(dto.password);
    }

    return await this.repository.update(id, updateData);
  }
}

