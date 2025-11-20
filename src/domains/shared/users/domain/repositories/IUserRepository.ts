/**
 * Interfaz para User Repository
 */

import { User } from '../entities/User';

export interface CreateUserData {
  tenant_id?: string | null;
  email: string;
  password_hash: string;
  role: 'SAAS_ADMIN' | 'SAAS_EDITOR' | 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER';
  first_name: string;
  last_name: string;
  phone?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  logistics_provider_id?: string | null;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  role?: 'SAAS_ADMIN' | 'SAAS_EDITOR' | 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  password_hash?: string;
  email_verified_at?: Date | null;
  email_verification_token?: string | null;
  password_reset_token?: string | null;
  password_reset_expires_at?: Date | null;
  last_login_at?: Date | null;
  failed_login_attempts?: number;
  locked_until?: Date | null;
  logistics_provider_id?: string | null;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenant_id: string): Promise<User[]>;
  findAll(): Promise<User[]>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

