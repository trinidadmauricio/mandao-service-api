/**
 * Use Case: Eliminar User
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteUserUseCase {
  constructor(@inject(TYPES.IUserRepository) private repository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('User not found');
    }

    await this.repository.delete(id);
  }
}

