/**
 * DTO para crear SubscriptionPlan
 */

import { z } from 'zod';

export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['BASIC', 'PRO', 'ENTERPRISE', 'CUSTOM']),
  price_monthly: z.number().nonnegative(),
  price_yearly: z.number().nonnegative(),
  features: z.record(z.unknown()),
  max_products: z.number().int().positive().nullable().optional(),
  max_orders_month: z.number().int().positive().nullable().optional(),
  max_branches: z.number().int().positive().nullable().optional(),
});

export type CreateSubscriptionPlanDto = z.infer<typeof createSubscriptionPlanSchema>;

