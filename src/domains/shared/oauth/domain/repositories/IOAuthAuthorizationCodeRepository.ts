/**
 * Interfaz para OAuthAuthorizationCode Repository
 */

import { OAuthAuthorizationCode } from '../entities/OAuthAuthorizationCode';

export interface CreateAuthorizationCodeData {
  code: string;
  client_id: string;
  user_id: string;
  redirect_uri: string;
  scope: string;
  expires_at: Date;
}

export interface IOAuthAuthorizationCodeRepository {
  findByCode(code: string): Promise<OAuthAuthorizationCode | null>;
  create(data: CreateAuthorizationCodeData): Promise<OAuthAuthorizationCode>;
  markAsUsed(code: string): Promise<void>;
  deleteExpiredCodes(): Promise<void>;
}

