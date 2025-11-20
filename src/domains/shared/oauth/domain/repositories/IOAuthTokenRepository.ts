/**
 * Interfaz para OAuth Token Repository (Access y Refresh)
 */

import { OAuthAccessToken } from '../entities/OAuthAccessToken';
import { OAuthRefreshToken } from '../entities/OAuthRefreshToken';

export interface CreateAccessTokenData {
  token: string;
  client_id: string;
  user_id: string | null;
  scope: string;
  expires_at: Date;
}

export interface CreateRefreshTokenData {
  token: string;
  access_token_id: string;
  client_id: string;
  user_id: string;
  expires_at: Date;
}

export interface IOAuthTokenRepository {
  // Access Tokens
  findAccessTokenByToken(token: string): Promise<OAuthAccessToken | null>;
  createAccessToken(data: CreateAccessTokenData): Promise<OAuthAccessToken>;
  revokeAccessToken(token: string): Promise<void>;

  // Refresh Tokens
  findRefreshTokenByToken(token: string): Promise<OAuthRefreshToken | null>;
  createRefreshToken(data: CreateRefreshTokenData): Promise<OAuthRefreshToken>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeRefreshTokensByAccessToken(access_token_id: string): Promise<void>;
}

