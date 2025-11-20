/**
 * Servicio para Authorization Code Flow
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthClientRepository } from '../../domain/repositories/IOAuthClientRepository';
import { IOAuthAuthorizationCodeRepository } from '../../domain/repositories/IOAuthAuthorizationCodeRepository';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';

export interface AuthorizationRequest {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state?: string;
}

@injectable()
export class OAuthAuthorizationService {
  constructor(
    @inject(TYPES.IOAuthClientRepository) private clientRepository: IOAuthClientRepository,
    @inject(TYPES.IOAuthAuthorizationCodeRepository) private codeRepository: IOAuthAuthorizationCodeRepository
  ) {}

  /**
   * Valida una solicitud de autorización
   */
  async validateAuthorizationRequest(request: AuthorizationRequest): Promise<void> {
    // Buscar client
    const client = await this.clientRepository.findByClientId(request.client_id);

    if (!client) {
      throw new Error('Invalid client_id');
    }

    if (!client.isActive()) {
      throw new Error('Client is not active');
    }

    // Validar response_type
    if (request.response_type !== 'code') {
      throw new Error('Invalid response_type. Only "code" is supported');
    }

    // Validar redirect_uri
    if (!client.isValidRedirectUri(request.redirect_uri)) {
      throw new Error('Invalid redirect_uri');
    }
  }

  /**
   * Genera un authorization code
   */
  async generateAuthorizationCode(
    client_id: string,
    user_id: string,
    redirect_uri: string,
    scope: string
  ): Promise<string> {
    // Generar code único
    const code = generateSecureToken(32);

    // Calcular expiración (10 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Guardar code en DB
    await this.codeRepository.create({
      code,
      client_id,
      user_id,
      redirect_uri,
      scope,
      expires_at: expiresAt,
    });

    return code;
  }

  /**
   * Intercambia un authorization code por tokens
   */
  async exchangeCodeForTokens(
    code: string,
    client_id: string,
    redirect_uri: string
  ): Promise<{ user_id: string; scope: string }> {
    // Buscar code
    const authCode = await this.codeRepository.findByCode(code);

    if (!authCode) {
      throw new Error('Invalid authorization code');
    }

    if (!authCode.canBeUsed()) {
      throw new Error('Authorization code expired or already used');
    }

    // Validar client_id
    if (authCode.client_id !== client_id) {
      throw new Error('Invalid client_id');
    }

    // Validar redirect_uri
    if (authCode.redirect_uri !== redirect_uri) {
      throw new Error('Invalid redirect_uri');
    }

    // Marcar code como usado
    await this.codeRepository.markAsUsed(code);

    return {
      user_id: authCode.user_id,
      scope: authCode.scope,
    };
  }
}

