/**
 * DTO para actualizar Branch
 */

import { z } from 'zod';

export const updateBranchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  address: z.string().min(1).max(500).optional(),
  gps_lat: z.number().min(-90).max(90).optional(),
  gps_lng: z.number().min(-180).max(180).optional(),
  contact_phone: z.string().min(1).max(20).optional(),
  is_main: z.boolean().optional(),
  operating_hours: z.record(z.unknown()).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type UpdateBranchDto = z.infer<typeof updateBranchSchema>;

