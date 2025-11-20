/**
 * DTO para crear Branch
 */

import { z } from 'zod';

export const createBranchSchema = z.object({
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(500),
  gps_lat: z.number().min(-90).max(90),
  gps_lng: z.number().min(-180).max(180),
  contact_phone: z.string().min(1).max(20),
  is_main: z.boolean().optional(),
  operating_hours: z.record(z.unknown()).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export type CreateBranchDto = z.infer<typeof createBranchSchema>;

