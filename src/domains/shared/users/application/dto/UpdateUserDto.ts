/**
 * DTO para actualizar User
 */

import { z } from 'zod';
import { USER_ROLE_VALUES } from '../../../../../shared/constants/permissions';

export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(USER_ROLE_VALUES).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  password: z.string().min(8).max(255).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

