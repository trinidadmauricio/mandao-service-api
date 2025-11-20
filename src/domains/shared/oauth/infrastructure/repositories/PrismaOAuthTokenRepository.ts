/**
 * Implementación de OAuth Token Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import {
  IOAuthTokenRepository,
  CreateAccessTokenData,
  CreateRefreshTokenData,
} from '../../domain/repositories/IOAuthTokenRepository';
import { OAuthAccessToken } from '../../domain/entities/OAuthAccessToken';
import { OAuthRefreshToken } from '../../domain/entities/OAuthRefreshToken';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaOAuthTokenRepository implements IOAuthTokenRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  // Access Tokens
  async findAccessTokenByToken(token: string): Promise<OAuthAccessToken | null> {
    const data = await this.prisma.oAuthAccessToken.findUnique({
      where: { token },
    });

    if (!data) {
      return null;
    }

    return this.toAccessTokenDomain(data);
  }

  async createAccessToken(data: CreateAccessTokenData): Promise<OAuthAccessToken> {
    const created = await this.prisma.oAuthAccessToken.create({
      data: {
        token: data.token,
        client_id: data.client_id,
        user_id: data.user_id ?? null,
        scope: data.scope,
        expires_at: data.expires_at,
        is_revoked: false,
      },
    });

    return this.toAccessTokenDomain(created);
  }

  async revokeAccessToken(token: string): Promise<void> {
    await this.prisma.oAuthAccessToken.update({
      where: { token },
      data: { is_revoked: true },
    });
  }

  // Refresh Tokens
  async findRefreshTokenByToken(token: string): Promise<OAuthRefreshToken | null> {
    const data = await this.prisma.oAuthRefreshToken.findUnique({
      where: { token },
    });

    if (!data) {
      return null;
    }

    return this.toRefreshTokenDomain(data);
  }

  async createRefreshToken(data: CreateRefreshTokenData): Promise<OAuthRefreshToken> {
    const created = await this.prisma.oAuthRefreshToken.create({
      data: {
        token: data.token,
        access_token_id: data.access_token_id,
        client_id: data.client_id,
        user_id: data.user_id,
        expires_at: data.expires_at,
        is_revoked: false,
      },
    });

    return this.toRefreshTokenDomain(created);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.oAuthRefreshToken.update({
      where: { token },
      data: { is_revoked: true },
    });
  }

  async revokeRefreshTokensByAccessToken(access_token_id: string): Promise<void> {
    await this.prisma.oAuthRefreshToken.updateMany({
      where: { access_token_id },
      data: { is_revoked: true },
    });
  }

  private toAccessTokenDomain(data: {
    id: string;
    token: string;
    client_id: string;
    user_id: string | null;
    scope: string;
    expires_at: Date;
    is_revoked: boolean;
    created_at: Date;
  }): OAuthAccessToken {
    return new OAuthAccessToken(
      data.id,
      data.token,
      data.client_id,
      data.user_id,
      data.scope,
      data.expires_at,
      data.is_revoked,
      data.created_at
    );
  }

  private toRefreshTokenDomain(data: {
    id: string;
    token: string;
    access_token_id: string;
    client_id: string;
    user_id: string;
    expires_at: Date;
    is_revoked: boolean;
    created_at: Date;
  }): OAuthRefreshToken {
    return new OAuthRefreshToken(
      data.id,
      data.token,
      data.access_token_id,
      data.client_id,
      data.user_id,
      data.expires_at,
      data.is_revoked,
      data.created_at
    );
  }
}
