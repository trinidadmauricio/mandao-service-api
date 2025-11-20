/**
 * DTOs para Driver
 */

import { z } from 'zod';

export const createDriverSchema = z.object({
  logistics_provider_id: z.string().uuid(),
  user_id: z.string().uuid(),
  identity_document: z.string().min(1).max(50),
  driving_license: z.string().min(1).max(50),
  date_of_birth: z.coerce.date(),
  emergency_contact: z.record(z.unknown()),
  has_own_vehicle: z.boolean(),
  vehicle_id: z.string().uuid().optional().nullable(),
  work_type: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE']),
  work_zone: z.string().optional().nullable(),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED']).optional(),
  documents: z.record(z.unknown()),
});

export const updateDriverSchema = z.object({
  identity_document: z.string().min(1).max(50).optional(),
  driving_license: z.string().min(1).max(50).optional(),
  date_of_birth: z.coerce.date().optional(),
  emergency_contact: z.record(z.unknown()).optional(),
  has_own_vehicle: z.boolean().optional(),
  vehicle_id: z.string().uuid().optional().nullable(),
  work_type: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCE']).optional(),
  work_zone: z.string().optional().nullable(),
  availability_status: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE', 'SUSPENDED']).optional(),
  documents: z.record(z.unknown()).optional(),
});

export type CreateDriverDto = z.infer<typeof createDriverSchema>;
export type UpdateDriverDto = z.infer<typeof updateDriverSchema>;

