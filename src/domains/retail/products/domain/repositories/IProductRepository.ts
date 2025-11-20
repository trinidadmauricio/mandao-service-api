/**
 * Interface para Product Repository
 */

import { Product } from '../entities/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySku(tenant_id: string, sku: string): Promise<Product | null>;
  findAll(tenant_id?: string, category_id?: string, is_active?: boolean): Promise<Product[]>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface CreateProductData {
  tenant_id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  name_translations?: Record<string, string> | null;
  description_translations?: Record<string, string> | null;
  category_id: string;
  brand_id?: string | null;
  cost_price: number;
  selling_price: number;
  compare_at_price?: number | null;
  currency?: string;
  track_inventory?: boolean;
  current_stock?: number;
  min_stock_alert?: number;
  uom?: 'UNIT' | 'KG' | 'G' | 'LITER' | 'ML' | 'BOX' | 'PACK';
  weight_kg?: number | null;
  dimensions?: Record<string, unknown> | null;
  images: Record<string, unknown>;
  featured_image_url?: string | null;
  has_variants?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface UpdateProductData {
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  name_translations?: Record<string, string> | null;
  description_translations?: Record<string, string> | null;
  category_id?: string;
  brand_id?: string | null;
  cost_price?: number;
  selling_price?: number;
  compare_at_price?: number | null;
  currency?: string;
  track_inventory?: boolean;
  current_stock?: number;
  min_stock_alert?: number;
  uom?: 'UNIT' | 'KG' | 'G' | 'LITER' | 'ML' | 'BOX' | 'PACK';
  weight_kg?: number | null;
  dimensions?: Record<string, unknown> | null;
  images?: Record<string, unknown>;
  featured_image_url?: string | null;
  has_variants?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
}

