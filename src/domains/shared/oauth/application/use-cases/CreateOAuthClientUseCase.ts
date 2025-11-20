/**
 * Use Case: Crear OAuthClient
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { CreateOAuthClientDto } from '../dto/CreateOAuthClientDto';
import { generateClientId, generateClientSecret, hashClientSecret } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateOAuthClientUseCase {
  constructor(@inject(TYPES.IOAuthClientRepository) private repository: IOAuthClientRepository) {}

  async execute(dto: CreateOAuthClientDto): Promise<{ client: OAuthClient; client_secret: string }> {
    // Generar client_id y client_secret
    const client_id = generateClientId();
    const client_secret = generateClientSecret();
    const client_secret_hash = await hashClientSecret(client_secret);

    // Crear client
    const client = await this.repository.create({
      tenant_id: dto.tenant_id,
      name: dto.name,
      redirect_uris: dto.redirect_uris,
      grant_types: dto.grant_types,
      scope: dto.scope,
      is_confidential: dto.is_confidential,
      client_id,
      client_secret_hash,
    });

    // Retornar client con secret (solo se muestra una vez)
    return {
      client,
      client_secret,
    };
  }
}

