/**
 * DTOs para Wishlist
 */

import { z } from 'zod';

export const addToWishlistSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  variant_id: z.string().uuid().nullable().optional(),
});

export type AddToWishlistDto = z.infer<typeof addToWishlistSchema>;

