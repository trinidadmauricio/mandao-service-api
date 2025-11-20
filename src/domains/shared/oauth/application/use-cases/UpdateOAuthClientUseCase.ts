/**
 * Use Case: Actualizar OAuthClient
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { UpdateOAuthClientDto } from '../dto/UpdateOAuthClientDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateOAuthClientUseCase {
  constructor(@inject(TYPES.IOAuthClientRepository) private repository: IOAuthClientRepository) {}

  async execute(id: string, dto: UpdateOAuthClientDto): Promise<OAuthClient> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('OAuth client not found');
    }

    return await this.repository.update(id, dto);
  }
}

