/**
 * DTO para actualizar un tenant
 */

import { z } from 'zod';

export const updateTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subscription_plan_id: z.string().uuid().optional(),
  subscription_status: z.enum(['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED']).optional(),
  subscription_expires_at: z.date().nullable().optional(),
  default_locale: z.string().length(2).optional(),
  default_currency: z.string().length(3).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type UpdateTenantDto = z.infer<typeof updateTenantSchema>;
