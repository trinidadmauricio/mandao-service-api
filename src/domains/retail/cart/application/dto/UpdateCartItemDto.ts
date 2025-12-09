/**
 * DTO para actualizar item del carrito
 */

import { z } from 'zod';

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().min(1),
});

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

