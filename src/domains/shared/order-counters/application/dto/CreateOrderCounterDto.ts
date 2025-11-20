/**
 * DTO para crear OrderCounter
 */

import { z } from 'zod';

export const createOrderCounterSchema = z.object({
  tenant_id: z.string().uuid(),
  prefix: z.string().max(10).nullable().optional(),
  padding_length: z.number().int().min(1).max(10).optional(),
});

export type CreateOrderCounterDto = z.infer<typeof createOrderCounterSchema>;

