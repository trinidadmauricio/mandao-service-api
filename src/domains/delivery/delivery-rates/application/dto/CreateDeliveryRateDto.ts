/**
 * DTOs para DeliveryRate
 */

import { z } from 'zod';

export const createDeliveryRateSchema = z.object({
  tenant_id: z.string().uuid(),
  zone_id: z.string().uuid().optional().nullable(),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']),
  distance_km_min: z.number().min(0),
  distance_km_max: z.number().min(0),
  base_price: z.number().min(0),
  price_per_km: z.number().min(0),
  currency: z.string().length(3).optional(),
  priority_multiplier: z.record(z.number()),
});

export const updateDeliveryRateSchema = z.object({
  zone_id: z.string().uuid().optional().nullable(),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']).optional(),
  distance_km_min: z.number().min(0).optional(),
  distance_km_max: z.number().min(0).optional(),
  base_price: z.number().min(0).optional(),
  price_per_km: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  priority_multiplier: z.record(z.number()).optional(),
});

export type CreateDeliveryRateDto = z.infer<typeof createDeliveryRateSchema>;
export type UpdateDeliveryRateDto = z.infer<typeof updateDeliveryRateSchema>;
