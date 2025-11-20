/**
 * Servicio para generación y gestión de tokens OAuth
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOAuthTokenRepository } from '../../domain/repositories/IOAuthTokenRepository';
import { generateAccessToken } from '../../../../../shared/utils/jwt.util';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

@injectable()
export class OAuthTokenService {
  constructor(@inject(TYPES.IOAuthTokenRepository) private tokenRepository: IOAuthTokenRepository) {}

  /**
   * Genera access token y refresh token para Authorization Code Flow
   */
  async generateTokensForUser(
    client_id: string,
    user_id: string,
    scope: string
  ): Promise<TokenResponse> {
    // Generar JWT access token
    const jwtAccessToken = generateAccessToken(
      {
        sub: user_id,
        client_id,
        scope,
      },
      '1h'
    );

    // Generar refresh token (opaque token)
    const refreshToken = generateSecureToken(32);

    // Calcular expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

    // Guardar tokens en DB
    const accessTokenEntity = await this.tokenRepository.createAccessToken({
      token: jwtAccessToken,
      client_id,
      user_id,
      scope,
      expires_at: expiresAt,
    });

    await this.tokenRepository.createRefreshToken({
      token: refreshToken,
      access_token_id: accessTokenEntity.id,
      client_id,
      user_id,
      expires_at: refreshExpiresAt,
    });

    return {
      access_token: jwtAccessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hora en segundos
      refresh_token: refreshToken,
      scope,
    };
  }

  /**
   * Genera access token para Client Credentials Flow (sin refresh token)
   */
  async generateTokenForClient(client_id: string, scope: string): Promise<TokenResponse> {
    // Generar JWT access token
    const jwtAccessToken = generateAccessToken(
      {
        sub: client_id,
        client_id,
        scope,
      },
      '1h'
    );

    // Calcular expiración
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Guardar token en DB
    await this.tokenRepository.createAccessToken({
      token: jwtAccessToken,
      client_id,
      user_id: null, // Client credentials no tiene user
      scope,
      expires_at: expiresAt,
    });

    return {
      access_token: jwtAccessToken,
      token_type: 'Bearer',
      expires_in: 3600, // 1 hora en segundos
      scope,
    };
  }

  /**
   * Refresca un access token usando un refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    // Buscar refresh token
    const refreshTokenEntity = await this.tokenRepository.findRefreshTokenByToken(refreshToken);

    if (!refreshTokenEntity || !refreshTokenEntity.isValid()) {
      throw new Error('Invalid refresh token');
    }

    // Revocar refresh token anterior (token rotation)
    await this.tokenRepository.revokeRefreshToken(refreshToken);

    // Revocar access token anterior
    await this.tokenRepository.revokeRefreshTokensByAccessToken(refreshTokenEntity.access_token_id);

    // Generar nuevos tokens
    const newRefreshToken = generateSecureToken(32);
    const jwtAccessToken = generateAccessToken(
      {
        sub: refreshTokenEntity.user_id,
        client_id: refreshTokenEntity.client_id,
        scope: 'read write', // TODO: obtener scope del token original
      },
      '1h'
    );

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

    // Guardar nuevos tokens
    const accessTokenEntity = await this.tokenRepository.createAccessToken({
      token: jwtAccessToken,
      client_id: refreshTokenEntity.client_id,
      user_id: refreshTokenEntity.user_id,
      scope: 'read write', // TODO: obtener scope del token original
      expires_at: expiresAt,
    });

    await this.tokenRepository.createRefreshToken({
      token: newRefreshToken,
      access_token_id: accessTokenEntity.id,
      client_id: refreshTokenEntity.client_id,
      user_id: refreshTokenEntity.user_id,
      expires_at: refreshExpiresAt,
    });

    return {
      access_token: jwtAccessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: newRefreshToken,
      scope: 'read write', // TODO: obtener scope del token original
    };
  }
}

