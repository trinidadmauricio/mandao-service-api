/**
 * DTOs para CreateOnDemandOrder
 */

import { z } from 'zod';

export const createOnDemandOrderItemSchema = z.object({
  product_snapshot: z.object({
    name: z.string().min(1),
    sku: z.string().optional(),
    price: z.number().min(0),
    currency: z.string().length(3),
  }).passthrough(), // Permite campos adicionales
  quantity: z.number().min(0.001),
  unit_price: z.number().min(0),
  notes: z.string().optional(),
});

export const createOnDemandOrderSchema = z.object({
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
  items: z.array(createOnDemandOrderItemSchema).min(1),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.coerce.date().optional(),
  estimated_delivery_at: z.coerce.date(),
  priority: z.enum(['NORMAL', 'URGENT']).optional(),
  cargo_description: z.string().optional(),
});

export type CreateOnDemandOrderDto = z.infer<typeof createOnDemandOrderSchema>;
export type CreateOnDemandOrderItemDto = z.infer<typeof createOnDemandOrderItemSchema>;

