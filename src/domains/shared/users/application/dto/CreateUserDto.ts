/**
 * DTO para crear User
 */

import { z } from 'zod';

export const createUserSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  role: z.enum(['SAAS_ADMIN', 'SAAS_EDITOR', 'OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'CUSTOMER']),
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  phone: z.string().max(20).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

