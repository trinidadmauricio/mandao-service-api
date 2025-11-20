/**
 * DTOs para ProductVariant
 */

import { z } from 'zod';

export const createProductVariantSchema = z.object({
  product_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  sku: z.string().min(1).max(255),
  barcode: z.string().optional().nullable(),
  option1_name: z.string().optional().nullable(),
  option1_value: z.string().optional().nullable(),
  option2_name: z.string().optional().nullable(),
  option2_value: z.string().optional().nullable(),
  option3_name: z.string().optional().nullable(),
  option3_value: z.string().optional().nullable(),
  price_adjustment: z.number().optional(),
  cost_price: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  track_inventory: z.boolean().optional(),
  current_stock: z.number().int().min(0).optional(),
  weight_kg: z.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional(),
});

export const updateProductVariantSchema = z.object({
  sku: z.string().min(1).max(255).optional(),
  barcode: z.string().optional().nullable(),
  option1_name: z.string().optional().nullable(),
  option1_value: z.string().optional().nullable(),
  option2_name: z.string().optional().nullable(),
  option2_value: z.string().optional().nullable(),
  option3_name: z.string().optional().nullable(),
  option3_value: z.string().optional().nullable(),
  price_adjustment: z.number().optional(),
  cost_price: z.number().min(0).optional().nullable(),
  currency: z.string().length(3).optional(),
  track_inventory: z.boolean().optional(),
  current_stock: z.number().int().min(0).optional(),
  weight_kg: z.number().min(0).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional(),
});

export type CreateProductVariantDto = z.infer<typeof createProductVariantSchema>;
export type UpdateProductVariantDto = z.infer<typeof updateProductVariantSchema>;

