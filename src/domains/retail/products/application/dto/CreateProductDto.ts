/**
 * DTOs para Product
 */

import { z } from 'zod';

export const createProductSchema = z.object({
  tenant_id: z.string().uuid(),
  sku: z.string().min(1).max(255),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  name_translations: z.record(z.string()).optional().nullable(),
  description_translations: z.record(z.string()).optional().nullable(),
  category_id: z.string().uuid(),
  brand_id: z.string().uuid().optional().nullable(),
  cost_price: z.number().min(0),
  selling_price: z.number().min(0),
  compare_at_price: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  track_inventory: z.boolean().optional(),
  current_stock: z.number().int().min(0).optional(),
  min_stock_alert: z.number().int().min(0).optional(),
  uom: z.enum(['UNIT', 'KG', 'G', 'LITER', 'ML', 'BOX', 'PACK']).optional(),
  weight_kg: z.number().min(0).optional().nullable(),
  dimensions: z.record(z.unknown()).optional().nullable(),
  images: z.record(z.unknown()),
  featured_image_url: z.string().url().optional().nullable(),
  has_variants: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

export const updateProductSchema = z.object({
  sku: z.string().min(1).max(255).optional(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  name_translations: z.record(z.string()).optional().nullable(),
  description_translations: z.record(z.string()).optional().nullable(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional().nullable(),
  cost_price: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
  compare_at_price: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  track_inventory: z.boolean().optional(),
  current_stock: z.number().int().min(0).optional(),
  min_stock_alert: z.number().int().min(0).optional(),
  uom: z.enum(['UNIT', 'KG', 'G', 'LITER', 'ML', 'BOX', 'PACK']).optional(),
  weight_kg: z.number().min(0).optional().nullable(),
  dimensions: z.record(z.unknown()).optional().nullable(),
  images: z.record(z.unknown()).optional(),
  featured_image_url: z.string().url().optional().nullable(),
  has_variants: z.boolean().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

