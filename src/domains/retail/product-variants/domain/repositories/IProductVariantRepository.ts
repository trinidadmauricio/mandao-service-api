/**
 * Interface para ProductVariant Repository
 */

import { ProductVariant } from '../entities/ProductVariant';

export interface IProductVariantRepository {
  findById(id: string): Promise<ProductVariant | null>;
  findBySku(tenant_id: string, sku: string): Promise<ProductVariant | null>;
  findByProductId(product_id: string): Promise<ProductVariant[]>;
  findAll(tenant_id?: string, product_id?: string): Promise<ProductVariant[]>;
  create(data: CreateProductVariantData): Promise<ProductVariant>;
  update(id: string, data: UpdateProductVariantData): Promise<ProductVariant>;
  delete(id: string): Promise<void>;
}

export interface CreateProductVariantData {
  product_id: string;
  tenant_id: string;
  sku: string;
  barcode?: string | null;
  option1_name?: string | null;
  option1_value?: string | null;
  option2_name?: string | null;
  option2_value?: string | null;
  option3_name?: string | null;
  option3_value?: string | null;
  price_adjustment?: number;
  cost_price?: number | null;
  currency?: string;
  track_inventory?: boolean;
  current_stock?: number;
  weight_kg?: number | null;
  image_url?: string | null;
  is_active?: boolean;
}

export interface UpdateProductVariantData {
  sku?: string;
  barcode?: string | null;
  option1_name?: string | null;
  option1_value?: string | null;
  option2_name?: string | null;
  option2_value?: string | null;
  option3_name?: string | null;
  option3_value?: string | null;
  price_adjustment?: number;
  cost_price?: number | null;
  currency?: string;
  track_inventory?: boolean;
  current_stock?: number;
  weight_kg?: number | null;
  image_url?: string | null;
  is_active?: boolean;
}

