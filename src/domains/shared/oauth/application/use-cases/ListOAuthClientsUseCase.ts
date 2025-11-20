/**
 * Use Case: Listar OAuthClients
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListOAuthClientsUseCase {
  constructor(@inject(TYPES.IOAuthClientRepository) private repository: IOAuthClientRepository) {}

  async execute(tenant_id?: string): Promise<OAuthClient[]> {
    if (tenant_id) {
      return await this.repository.findByTenantId(tenant_id);
    }
    return await this.repository.findAll();
  }
}

