/**
 * Interfaz para OAuthClient Repository
 */

import { OAuthClient } from '../entities/OAuthClient';

export interface CreateOAuthClientData {
  tenant_id?: string | null;
  name: string;
  redirect_uris: string[];
  grant_types: string[];
  scope: string;
  is_confidential: boolean;
}

export interface UpdateOAuthClientData {
  name?: string;
  redirect_uris?: string[];
  grant_types?: string[];
  scope?: string;
  is_active?: boolean;
}

export interface IOAuthClientRepository {
  findById(id: string): Promise<OAuthClient | null>;
  findByClientId(client_id: string): Promise<OAuthClient | null>;
  findByTenantId(tenant_id: string): Promise<OAuthClient[]>;
  findAll(): Promise<OAuthClient[]>;
  create(data: CreateOAuthClientData & { client_id: string; client_secret_hash: string }): Promise<OAuthClient>;
  update(id: string, data: UpdateOAuthClientData): Promise<OAuthClient>;
  delete(id: string): Promise<void>;
}

