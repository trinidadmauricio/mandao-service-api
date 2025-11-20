/**
 * Use Case: Eliminar OAuthClient
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteOAuthClientUseCase {
  constructor(@inject(TYPES.IOAuthClientRepository) private repository: IOAuthClientRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('OAuth client not found');
    }

    await this.repository.delete(id);
  }
}

