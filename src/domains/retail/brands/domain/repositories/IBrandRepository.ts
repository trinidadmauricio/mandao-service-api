/**
 * Interface para Brand Repository
 */

import { Brand } from '../entities/Brand';

export interface IBrandRepository {
  findById(id: string): Promise<Brand | null>;
  findBySlug(tenant_id: string, slug: string): Promise<Brand | null>;
  findAll(tenant_id?: string): Promise<Brand[]>;
  create(data: CreateBrandData): Promise<Brand>;
  update(id: string, data: UpdateBrandData): Promise<Brand>;
  delete(id: string): Promise<void>;
}

export interface CreateBrandData {
  tenant_id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateBrandData {
  name?: string;
  slug?: string;
  logo_url?: string | null;
  description?: string | null;
  is_active?: boolean;
}

