/**
 * DTO para actualizar SubscriptionPlan
 */

import { z } from 'zod';

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  price_monthly: z.number().nonnegative().optional(),
  price_yearly: z.number().nonnegative().optional(),
  features: z.record(z.unknown()).optional(),
  max_products: z.number().int().positive().nullable().optional(),
  max_orders_month: z.number().int().positive().nullable().optional(),
  max_branches: z.number().int().positive().nullable().optional(),
});

export type UpdateSubscriptionPlanDto = z.infer<typeof updateSubscriptionPlanSchema>;

