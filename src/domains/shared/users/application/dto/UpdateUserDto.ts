/**
 * DTO para actualizar User
 */

import { z } from 'zod';

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(['SAAS_ADMIN', 'SAAS_EDITOR', 'OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'CUSTOMER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  password: z.string().min(8).max(255).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

