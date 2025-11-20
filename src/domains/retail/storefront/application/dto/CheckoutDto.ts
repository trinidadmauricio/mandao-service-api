/**
 * DTOs para Storefront API
 */

import { z } from 'zod';

export const checkoutSchema = z.object({
  tenant_id: z.string().uuid(),
  items: z.array(
    z.object({
      product_id: z.string().uuid().optional(),
      variant_id: z.string().uuid().optional(),
      quantity: z.number().int().min(1),
    })
  ),
  customer: z.object({
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
  pickup_address: z
    .object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().optional(),
      zip_code: z.string().optional(),
      country: z.string().min(1),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
  branch_id: z.string().uuid(),
  currency: z.string().length(3).optional(),
  locale: z.string().optional(),
  special_instructions: z.string().optional(),
  scheduled_pickup_at: z.string().datetime().optional(),
  estimated_delivery_at: z.string().datetime(),
  priority: z.enum(['NORMAL', 'URGENT']).optional(),
});

export type CheckoutDto = z.infer<typeof checkoutSchema>;

