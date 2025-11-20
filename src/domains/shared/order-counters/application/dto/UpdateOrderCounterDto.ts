/**
 * DTO para actualizar OrderCounter
 */

import { z } from 'zod';

export const updateOrderCounterSchema = z.object({
  current_value: z.number().int().nonnegative().optional(),
  prefix: z.string().max(10).nullable().optional(),
  padding_length: z.number().int().min(1).max(10).optional(),
  reset: z.boolean().optional(),
});

export type UpdateOrderCounterDto = z.infer<typeof updateOrderCounterSchema>;

