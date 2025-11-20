/**
 * DTO para Registro
 */

import { z } from 'zod';

export const registerSchema = z.object({
  tenant_id: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  password: z.string().min(8).max(255),
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  phone: z.string().max(20).nullable().optional(),
  role: z.enum(['OWNER', 'SUPERVISOR', 'MERCHANT_USER', 'CUSTOMER']).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;

