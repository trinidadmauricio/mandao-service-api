/**
 * DTO para crear un tenant
 */

import { z } from 'zod';

export const createTenantSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(255),
  type: z.enum(['RETAIL', 'ON_DEMAND', 'HYBRID']),
  subscription_plan_id: z.string().uuid().optional(),
  default_locale: z.string().length(2).optional(),
  default_currency: z.string().length(3).optional(),
  settings: z.record(z.unknown()).optional(),
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;
