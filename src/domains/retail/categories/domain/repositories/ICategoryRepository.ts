/**
 * Interface para Category Repository
 */

import { Category } from '../entities/Category';

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findBySlug(tenant_id: string, slug: string): Promise<Category | null>;
  findAll(tenant_id?: string, parent_id?: string | null): Promise<Category[]>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface CreateCategoryData {
  tenant_id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData {
  parent_id?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

