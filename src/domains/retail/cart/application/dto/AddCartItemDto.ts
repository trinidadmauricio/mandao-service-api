/**
 * DTO para agregar item al carrito
 */

import { z } from 'zod';

export const addCartItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable().optional(),
  quantity: z.number().int().positive().min(1),
});

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;

