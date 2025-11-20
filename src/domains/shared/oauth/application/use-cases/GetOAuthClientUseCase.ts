/**
 * Use Case: Obtener OAuthClient por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetOAuthClientUseCase {
  constructor(@inject(TYPES.IOAuthClientRepository) private repository: IOAuthClientRepository) {}

  async execute(id: string): Promise<OAuthClient> {
    const client = await this.repository.findById(id);

    if (!client) {
      throw new Error('OAuth client not found');
    }

    return client;
  }
}

