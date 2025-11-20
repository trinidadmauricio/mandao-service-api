/**
 * DTOs para Category
 */

import { z } from 'zod';

export const createCategorySchema = z.object({
  tenant_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  parent_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

