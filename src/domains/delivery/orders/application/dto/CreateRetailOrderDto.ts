/**
 * DTOs para CreateRetailOrder
 */

import { z } from 'zod';

export const createRetailOrderItemSchema = z.object({
  product_id: z.string().uuid().optional(),
  variant_id: z.string().uuid().optional(),
  product_snapshot: z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().length(3),
  }).passthrough().optional(), // Permite campos adicionales, opcional porque se puede calcular
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0).optional(), // Opcional porque se puede calcular
  notes: z.string().optional(),
});

export const createRetailOrderSchema = z.object({
  tenant_id: z.string().uuid(),
  customer_snapshot: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().min(1),
  }),
  delivery_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
  pickup_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  items: z.array(createRetailOrderItemSchema).min(1),
  branch_id: z.string().uuid(),
  currency: z.string().length(3).optional(),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.preprocess(
    (val) => {
      if (!val) return undefined;
      const str = String(val);
      // Si viene como "2025-11-22T16:35", agregar ":00" para hacerlo válido
      if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return `${str}:00`;
      }
      return str;
    },
    z.coerce.date().optional()
  ),
  estimated_delivery_at: z.preprocess(
    (val) => {
      const str = String(val);
      // Si viene como "2025-11-22T16:35", agregar ":00" para hacerlo válido
      if (str.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
        return `${str}:00`;
      }
      return str;
    },
    z.coerce.date()
  ),
  priority: z.enum(['NORMAL', 'URGENT']).optional(),
});

export type CreateRetailOrderDto = z.infer<typeof createRetailOrderSchema>;
export type CreateRetailOrderItemDto = z.infer<typeof createRetailOrderItemSchema>;

