/**
 * DTOs para DeliveryZone
 */

import { z } from 'zod';

export const createDeliveryZoneSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  boundary: z.string().min(1), // PostGIS WKT
  base_rate: z.number().min(0),
  rate_per_km: z.number().min(0),
  surge_multiplier: z.number().min(0).max(10).optional(),
  currency: z.string().length(3).optional(),
  is_active: z.boolean().optional(),
});

export const updateDeliveryZoneSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  boundary: z.string().min(1).optional(),
  base_rate: z.number().min(0).optional(),
  rate_per_km: z.number().min(0).optional(),
  surge_multiplier: z.number().min(0).max(10).optional(),
  currency: z.string().length(3).optional(),
  is_active: z.boolean().optional(),
});

export type CreateDeliveryZoneDto = z.infer<typeof createDeliveryZoneSchema>;
export type UpdateDeliveryZoneDto = z.infer<typeof updateDeliveryZoneSchema>;
