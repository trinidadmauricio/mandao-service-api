/**
 * Interface para Tenant Repository
 */

import { Tenant } from '../entities/Tenant';

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  create(data: CreateTenantData): Promise<Tenant>;
  update(id: string, data: UpdateTenantData): Promise<Tenant>;
  delete(id: string): Promise<void>;
}

export interface CreateTenantData {
  slug: string;
  name: string;
  type: 'RETAIL' | 'ON_DEMAND' | 'HYBRID';
  subscription_plan_id?: string;
  default_locale?: string;
  default_currency?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateTenantData {
  name?: string;
  subscription_plan_id?: string;
  subscription_status?: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  subscription_expires_at?: Date | null;
  default_locale?: string;
  default_currency?: string;
  settings?: Record<string, unknown>;
}
