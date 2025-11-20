/**
 * Use Case: Obtener User por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetUserUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

