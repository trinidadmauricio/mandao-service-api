/**
 * DTOs para Vehicle
 */

import { z } from 'zod';

export const createVehicleSchema = z.object({
  logistics_provider_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']),
  license_plate: z.string().min(1).max(20),
  brand: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2100),
  color: z.string().min(1).max(50),
  insurance_policy: z.string().min(1).max(100),
  insurance_expires_at: z.coerce.date(),
  last_maintenance_at: z.coerce.date().optional().nullable(),
  status: z.enum(['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE', 'OUT_OF_SERVICE']).optional(),
  specifications: z.record(z.unknown()).optional().nullable(),
});

export const updateVehicleSchema = z.object({
  logistics_provider_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  vehicle_type: z.enum(['MOTORCYCLE', 'SEDAN', 'MINI_VAN', 'PANEL', 'TRUCK', 'PICKUP']).optional(),
  license_plate: z.string().min(1).max(20).optional(),
  brand: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  color: z.string().min(1).max(50).optional(),
  insurance_policy: z.string().min(1).max(100).optional(),
  insurance_expires_at: z.coerce.date().optional(),
  last_maintenance_at: z.coerce.date().optional().nullable(),
  status: z.enum(['AVAILABLE', 'IN_SERVICE', 'MAINTENANCE', 'OUT_OF_SERVICE']).optional(),
  specifications: z.record(z.unknown()).optional().nullable(),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;

